import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { initOfflineSync, subscribeSyncState, type SyncProgress } from '@/database/offlineSync';

function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View className="mt-2 h-2 w-full overflow-hidden rounded-full bg-emerald-200/60">
      <View className="h-full rounded-full bg-white" style={{ width: `${clamped}%` }} />
    </View>
  );
}

export function SyncProgressBanner() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<{ online: boolean; progress: SyncProgress }>({
    online: true,
    progress: { active: false, currentLabel: null, completed: 0, total: 0, successMessage: null },
  });

  useEffect(() => {
    initOfflineSync();
    return subscribeSyncState(setState);
  }, []);

  const { progress } = state;
  const visible = progress.active || !!progress.successMessage;
  if (!visible) return null;

  const percent = progress.total > 0
    ? Math.round(((progress.completed + (progress.active ? 0.2 : 0)) / progress.total) * 100)
    : 0;

  return (
    <View
      pointerEvents="none"
      style={{ paddingTop: insets.top + 8, paddingHorizontal: 12 }}
      className="absolute left-0 right-0 top-0 z-50"
    >
      <View className="rounded-2xl bg-emerald-800 px-4 py-3 shadow-lg">
        {progress.successMessage ? (
          <Text className="text-center text-sm font-bold text-white">{progress.successMessage}</Text>
        ) : (
          <>
            <Text className="text-sm font-bold text-white">Enviando dados pendentes...</Text>
            <Text className="mt-0.5 text-xs text-emerald-100" numberOfLines={1}>
              {progress.currentLabel ?? 'Preparando envio'}
            </Text>
            <ProgressBar value={percent} />
            <Text className="mt-1 text-[11px] text-emerald-100">
              {Math.min(progress.completed + 1, progress.total)} de {progress.total}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}
