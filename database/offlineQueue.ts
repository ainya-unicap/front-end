import db from './localDb';
import { getUserId } from './auth';

export type OfflineCanteiroPayload = {
  plant_id: string;
  name: string;
  list_name?: string;
  turma_id?: string;
};

export type OfflineFormularioPhoto = {
  uri: string;
  mimeType: string;
  fileName: string;
};

export type OfflineFormularioPayload = {
  list_id: string;
  type: 'SEMANAL';
  title: string;
  date: string;
  week?: number;
  weather?: 'SOL' | 'NUBLADO' | 'CHUVA';
  estimated_height_cm?: number;
  phenological_stage?: 'VEGETATIVO' | 'ELONGACAO' | 'FLORESCIMENTO';
  checklist_irrigacao: boolean;
  checklist_capina: boolean;
  checklist_adubacao: boolean;
  checklist_plantio: boolean;
  checklist_pragas: boolean;
  observations?: string;
};

export type PendingCanteiroItem = {
  kind: 'canteiro';
  localId: number;
  createdAt: string;
  displayName: string;
  payload: OfflineCanteiroPayload;
};

export type PendingFormularioItem = {
  kind: 'formulario';
  localId: number;
  createdAt: string;
  displayName: string;
  listId: string;
  payload: OfflineFormularioPayload;
  photos: OfflineFormularioPhoto[];
};

export type PendingQueueItem = PendingCanteiroItem | PendingFormularioItem;

function nowIso() {
  return new Date().toISOString();
}

export function enqueueCanteiro(payload: OfflineCanteiroPayload) {
  db.runSync(
    `INSERT INTO offline_canteiros (payload_json, display_name, created_at) VALUES (?, ?, ?)`,
    [JSON.stringify(payload), payload.name, nowIso()]
  );
}

export function enqueueFormulario(
  payload: OfflineFormularioPayload,
  photos: OfflineFormularioPhoto[]
) {
  const result = db.runSync(
    `INSERT INTO offline_formularios (list_id, payload_json, title, created_at) VALUES (?, ?, ?, ?)`,
    [payload.list_id, JSON.stringify(payload), payload.title, nowIso()]
  ) as any;

  let formularioLocalId: number | undefined = result?.lastInsertRowId ?? result?.lastInsertRowid;
  if (!formularioLocalId) {
    const row = db.getFirstSync<{ id: number }>(
      `SELECT id FROM offline_formularios ORDER BY id DESC LIMIT 1`
    );
    formularioLocalId = row?.id;
  }
  if (!formularioLocalId) return;

  photos.forEach((photo, index) => {
    db.runSync(
      `INSERT INTO offline_formulario_photos (formulario_local_id, uri, mime_type, file_name, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      [formularioLocalId, photo.uri, photo.mimeType, photo.fileName, index]
    );
  });
}

function getQueuedCanteiros(): PendingCanteiroItem[] {
  const rows = db.getAllSync<any>(`SELECT id, payload_json, display_name, created_at FROM offline_canteiros ORDER BY id ASC`);
  return (rows ?? []).map((row) => ({
    kind: 'canteiro' as const,
    localId: Number(row.id),
    createdAt: String(row.created_at),
    displayName: String(row.display_name ?? ''),
    payload: JSON.parse(String(row.payload_json)) as OfflineCanteiroPayload,
  }));
}

function getQueuedFormularios(): PendingFormularioItem[] {
  const rows = db.getAllSync<any>(`SELECT id, list_id, payload_json, title, created_at FROM offline_formularios ORDER BY id ASC`);
  return (rows ?? []).map((row) => {
    const localId = Number(row.id);
    const photosRows = db.getAllSync<any>(
      `SELECT uri, mime_type, file_name, sort_order FROM offline_formulario_photos WHERE formulario_local_id = ? ORDER BY sort_order ASC, id ASC`,
      [localId]
    );
    const photos: OfflineFormularioPhoto[] = (photosRows ?? []).map((p) => ({
      uri: String(p.uri),
      mimeType: String(p.mime_type),
      fileName: String(p.file_name),
    }));
    return {
      kind: 'formulario' as const,
      localId,
      createdAt: String(row.created_at),
      displayName: String(row.title ?? ''),
      listId: String(row.list_id),
      payload: JSON.parse(String(row.payload_json)) as OfflineFormularioPayload,
      photos,
    };
  });
}

export function getPendingQueue(): PendingQueueItem[] {
  const items: PendingQueueItem[] = [...getQueuedCanteiros(), ...getQueuedFormularios()];
  items.sort((a, b) => {
    const ta = Date.parse(a.createdAt) || 0;
    const tb = Date.parse(b.createdAt) || 0;
    if (ta !== tb) return ta - tb;
    // desempate estável: canteiros antes de formulários se mesmo timestamp, depois por id
    if (a.kind !== b.kind) return a.kind === 'canteiro' ? -1 : 1;
    return a.localId - b.localId;
  });
  return items;
}

export function hasPendingQueue() {
  return getPendingQueue().length > 0;
}

export function clearPendingQueue() {
  db.runSync(`DELETE FROM offline_formulario_photos`);
  db.runSync(`DELETE FROM offline_formularios`);
  db.runSync(`DELETE FROM offline_canteiros`);
}

export function removePendingItem(item: PendingQueueItem) {
  if (item.kind === 'canteiro') {
    db.runSync(`DELETE FROM offline_canteiros WHERE id = ?`, [item.localId]);
  } else {
    db.runSync(`DELETE FROM offline_formulario_photos WHERE formulario_local_id = ?`, [item.localId]);
    db.runSync(`DELETE FROM offline_formularios WHERE id = ?`, [item.localId]);
  }
}

// Cache de perfil (dados básicos usados nas telas)
export function saveProfileCache(profile: unknown) {
  const userId = getUserId();
  if (!userId) return;
  db.runSync(
    `INSERT INTO profile_cache (user_id, data_json, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at`,
    [String(userId), JSON.stringify(profile ?? null), nowIso()]
  );
}

export function getProfileCache<T = any>(): T | null {
  const userId = getUserId();
  if (!userId) return null;
  const row = db.getFirstSync<{ data_json: string }>(
    `SELECT data_json FROM profile_cache WHERE user_id = ?`,
    [String(userId)]
  );
  if (!row?.data_json) return null;
  try {
    return JSON.parse(String(row.data_json)) as T;
  } catch {
    return null;
  }
}

export function clearProfileCache() {
  const userId = getUserId();
  if (!userId) return;
  db.runSync(`DELETE FROM profile_cache WHERE user_id = ?`, [String(userId)]);
}
