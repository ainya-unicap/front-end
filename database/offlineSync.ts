import axios from 'axios';
import { AppState } from 'react-native';
import { mutate } from 'swr';

import { api } from './index';
import { getAccessToken, getUserId } from './auth';
import {
  clearPendingQueue,
  getPendingQueue,
  removePendingItem,
  type PendingQueueItem,
} from './offlineQueue';

export type SyncProgress = {
  active: boolean;
  currentLabel: string | null;
  completed: number;
  total: number;
  successMessage: string | null;
};

type Listener = (state: { online: boolean; progress: SyncProgress }) => void;

const listeners = new Set<Listener>();

let online = true;
let syncing = false;
let successTimer: ReturnType<typeof setTimeout> | null = null;

let progress: SyncProgress = {
  active: false,
  currentLabel: null,
  completed: 0,
  total: 0,
  successMessage: null,
};

function emit() {
  const snapshot = { online, progress: { ...progress } };
  listeners.forEach((fn) => fn(snapshot));
}

export function subscribeSyncState(listener: Listener) {
  listeners.add(listener);
  listener({ online, progress: { ...progress } });
  return () => {
    listeners.delete(listener);
  };
}

export function getSyncSnapshot() {
  return { online, progress: { ...progress } };
}

function setOnline(value: boolean) {
  if (online === value) return;
  online = value;
  emit();
  if (value) {
    // Ao recuperar conexão, tenta sincronizar (se logado e houver pendências)
    void flushPendingQueue();
  }
}

export function markOffline() {
  setOnline(false);
}

export function markOnline() {
  setOnline(true);
}

export function isLikelyOnline() {
  return online;
}

async function probeConnectivity(): Promise<boolean> {
  try {
    // Tenta módulo do Expo se disponível
    const Network: any = await import('expo-network');
    if (Network?.getNetworkStateAsync) {
      const state = await Network.getNetworkStateAsync();
      const connected = !!state?.isConnected && state?.isInternetReachable !== false;
      setOnline(connected);
      return connected;
    }
  } catch {
    // fallback abaixo
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    await fetch(api.defaults.baseURL ?? 'https://back-end-ainya.vercel.app/api/', {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    setOnline(true);
    return true;
  } catch {
    // Sem resposta confiável: mantém estado atual (falhas de request marcam offline)
    return online;
  }
}

let networkSubscription: { remove?: () => void } | null = null;
let appStateSubscription: { remove?: () => void } | null = null;
let initialized = false;

export function initOfflineSync() {
  if (initialized) return;
  initialized = true;

  void probeConnectivity();

  void (async () => {
    try {
      const Network: any = await import('expo-network');
      if (Network?.addNetworkStateListener) {
        networkSubscription = Network.addNetworkStateListener((state: any) => {
          const connected = !!state?.isConnected && state?.isInternetReachable !== false;
          setOnline(connected);
        });
      }
    } catch {
      // Sem expo-network: dependemos de markOffline/markOnline e probe
    }
  })();

  appStateSubscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      void probeConnectivity().then((ok) => {
        if (ok) void flushPendingQueue();
      });
    }
  });
}

function authHeaders(extra?: Record<string, string>) {
  const token = getAccessToken();
  return {
    ...(extra ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function rawUrl(path: string) {
  const base = api.defaults.baseURL ?? '';
  return `${base}${path}`;
}

async function uploadItem(item: PendingQueueItem) {
  const userId = getUserId();

  if (item.kind === 'canteiro') {
    await axios.post(rawUrl('canteiros'), item.payload, {
      headers: authHeaders({ 'Content-Type': 'application/json' }),
    });
    return;
  }

  // Formulário: criar -> enviar fotos -> finalizar (mesmos endpoints do fluxo online)
  const createResponse = await axios.post(
    rawUrl('formularios'),
    { ...item.payload, ...(userId ? { user_id: userId } : {}) },
    { headers: authHeaders({ 'Content-Type': 'application/json' }) }
  );

  const created = createResponse?.data;
  const formularioId = created?.id ?? created?.data?.id;
  if (!formularioId) {
    throw new Error('A API não retornou o ID do formulário criado durante a sincronização.');
  }

  for (const photo of item.photos ?? []) {
    const formData = new FormData();
    formData.append('photo', {
      uri: photo.uri,
      type: photo.mimeType,
      name: photo.fileName,
    } as any);
    formData.append('form_id', String(formularioId));
    if (userId) formData.append('user_id', String(userId));

    await axios.post(rawUrl('photos/upload'), formData, {
      headers: authHeaders({ 'Content-Type': 'multipart/form-data' }),
    });
  }

  await axios.post(rawUrl(`formularios/${formularioId}/finalizar`), undefined, {
    headers: authHeaders({ 'Content-Type': 'application/json' }),
  });
}

export async function flushPendingQueue(): Promise<void> {
  if (syncing) return;

  const userId = getUserId();
  const token = getAccessToken();
  if (!userId || !token) return;

  const queue = getPendingQueue();
  if (queue.length === 0) return;

  // Garante que há conexão antes de tentar
  const connected = await probeConnectivity();
  if (!connected) return;

  syncing = true;
  if (successTimer) {
    clearTimeout(successTimer);
    successTimer = null;
  }

  const total = queue.length;
  progress = { active: true, currentLabel: null, completed: 0, total, successMessage: null };
  emit();

  try {
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      progress = {
        active: true,
        currentLabel: item.displayName || (item.kind === 'canteiro' ? 'Canteiro' : 'Formulário'),
        completed: i,
        total,
        successMessage: null,
      };
      emit();

      await uploadItem(item);
      removePendingItem(item);
    }

    // Limpa o banco local temporário após sucesso completo
    clearPendingQueue();

    // Atualiza telas que dependem dos dados enviados
    await Promise.allSettled([
      mutate('user-canteiros'),
      mutate('home'),
      mutate('relatorios'),
      mutate((key) => typeof key === 'string' && key.startsWith('canteiro-forms-')),
    ]);

    progress = {
      active: false,
      currentLabel: null,
      completed: total,
      total,
      successMessage: 'Canteiros atualizados com sucesso.',
    };
    emit();

    successTimer = setTimeout(() => {
      progress = { ...progress, successMessage: null, completed: 0, total: 0 };
      emit();
      successTimer = null;
    }, 4000);
  } catch (error) {
    // Interrompe a fila; itens não enviados permanecem no banco local para nova tentativa
    console.error('Erro ao sincronizar dados offline:', error);
    markOffline();
    progress = { active: false, currentLabel: null, completed: 0, total: 0, successMessage: null };
    emit();
  } finally {
    syncing = false;
  }
}

// Usado pelo interceptor antes de GETs (após login)
export async function ensureSyncedBeforeGet() {
  try {
    await flushPendingQueue();
  } catch {
    // falha tratada internamente
  }
}
