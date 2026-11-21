import db from './localDb';
import { getUserId } from './auth';

function nowIso() {
  return new Date().toISOString();
}

function scopedKey(key: string) {
  const userId = getUserId();
  return userId ? `u:${userId}:${key}` : `anon:${key}`;
}

export function setApiCache(key: string, data: unknown) {
  try {
    db.runSync(
      `INSERT INTO api_cache (cache_key, data_json, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(cache_key) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at`,
      [scopedKey(key), JSON.stringify(data ?? null), nowIso()]
    );
  } catch {
    // cache é best-effort
  }
}

export function getApiCache<T = any>(key: string): T | null {
  try {
    const row = db.getFirstSync<{ data_json: string }>(
      `SELECT data_json FROM api_cache WHERE cache_key = ?`,
      [scopedKey(key)]
    );
    if (!row?.data_json) return null;
    return JSON.parse(String(row.data_json)) as T;
  } catch {
    return null;
  }
}

export function clearApiCache(key: string) {
  try {
    db.runSync(`DELETE FROM api_cache WHERE cache_key = ?`, [scopedKey(key)]);
  } catch {
    // ignore
  }
}

export function isNetworkLikeError(error: unknown) {
  const e = error as { response?: unknown; code?: string; message?: string };
  return !e?.response && (e?.code === 'ERR_NETWORK' || /network/i.test(e?.message ?? ''));
}

export async function cachedGet<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { allowStaleOnError?: boolean }
): Promise<T> {
  try {
    const data = await fetcher();
    setApiCache(key, data);
    return data;
  } catch (error) {
    if (options?.allowStaleOnError !== false) {
      const cached = getApiCache<T>(key);
      if (cached != null) return cached;
    }
    throw error;
  }
}
