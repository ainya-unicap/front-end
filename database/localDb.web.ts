const memoryTables: Record<string, any[]> = {
  offline_canteiros: [],
  offline_formularios: [],
  offline_formulario_photos: [],
  profile_cache: [],
  plantas_cache: [],
  api_cache: [],
  offline_mutations: [],
};

const authStore: Record<string, string> = {};

function nowIso() {
  return new Date().toISOString();
}

function nextId(rows: any[]) {
  return (rows.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) || 0) + 1;
}

function matchInsert(table: string, _query: string, params: any[]) {
  if (table === "auth") {
    const [key, value] = params;
    authStore[String(key)] = String(value);
    return { lastInsertRowId: 0, changes: 1 };
  }
  if (table === "profile_cache") {
    const [user_id, data_json, updated_at] = params;
    const rows = memoryTables.profile_cache;
    const idx = rows.findIndex((r) => r.user_id === user_id);
    const row = { user_id, data_json, updated_at: updated_at ?? nowIso() };
    if (idx >= 0) rows[idx] = row;
    else rows.push(row);
    return { lastInsertRowId: 0, changes: 1 };
  }
  if (table === "plantas_cache") {
    const [id, data_json, updated_at] = params;
    const rows = memoryTables.plantas_cache;
    const idx = rows.findIndex((r) => String(r.id) === String(id));
    const row = { id: String(id), data_json, updated_at: updated_at ?? nowIso() };
    if (idx >= 0) rows[idx] = row;
    else rows.push(row);
    return { lastInsertRowId: 0, changes: 1 };
  }
  if (table === "api_cache") {
    const [cache_key, data_json, updated_at] = params;
    const rows = memoryTables.api_cache;
    const idx = rows.findIndex((r) => r.cache_key === cache_key);
    const row = { cache_key, data_json, updated_at: updated_at ?? nowIso() };
    if (idx >= 0) rows[idx] = row;
    else rows.push(row);
    return { lastInsertRowId: 0, changes: 1 };
  }
  if (table === "offline_mutations") {
    const [kind, entity_type, entity_id, payload_json, display_name, created_at] = params;
    const rows = memoryTables.offline_mutations;
    const id = nextId(rows);
    rows.push({ id, kind, entity_type, entity_id, payload_json, display_name, created_at: created_at ?? nowIso() });
    return { lastInsertRowId: id, changes: 1 };
  }
  if (table === "offline_canteiros") {
    const [payload_json, display_name, created_at] = params;
    const rows = memoryTables.offline_canteiros;
    const id = nextId(rows);
    rows.push({ id, payload_json, display_name, created_at: created_at ?? nowIso() });
    return { lastInsertRowId: id, changes: 1 };
  }
  if (table === "offline_formularios") {
    const [list_id, payload_json, title, created_at] = params;
    const rows = memoryTables.offline_formularios;
    const id = nextId(rows);
    rows.push({ id, list_id, payload_json, title, created_at: created_at ?? nowIso() });
    return { lastInsertRowId: id, changes: 1 };
  }
  if (table === "offline_formulario_photos") {
    const [formulario_local_id, uri, mime_type, file_name, sort_order] = params;
    const rows = memoryTables.offline_formulario_photos;
    const id = nextId(rows);
    rows.push({ id, formulario_local_id, uri, mime_type, file_name, sort_order: sort_order ?? 0 });
    return { lastInsertRowId: id, changes: 1 };
  }
  return { lastInsertRowId: 0, changes: 0 };
}

const db = {
  execSync: (_query: string) => {
    return;
  },

  // Compatibilidade com o uso atual de auth em algumas plataformas (chave direta)
  getFirstSync: (queryOrKey: string, params?: any[]) => {
    if (typeof params !== "undefined") {
      const q = String(queryOrKey);
      if (q.includes("FROM auth")) {
        const key = params[0];
        const value = authStore[String(key)];
        return value != null ? { value } : null;
      }
      if (q.includes("FROM profile_cache")) {
        const userId = params[0];
        return memoryTables.profile_cache.find((r) => r.user_id === userId) ?? null;
      }
      if (q.includes("FROM api_cache")) {
        const key = params[0];
        return memoryTables.api_cache.find((r) => r.cache_key === key) ?? null;
      }
      if (q.includes("FROM offline_formularios") && q.includes("WHERE id")) {
        const id = params[0];
        return memoryTables.offline_formularios.find((r) => r.id === id) ?? null;
      }
      if (q.includes("FROM offline_mutations") && q.includes("WHERE id")) {
        const id = params[0];
        return memoryTables.offline_mutations.find((r) => r.id === id) ?? null;
      }
      return null;
    }

    const value = authStore[String(queryOrKey)];
    return value ? { value } : null;
  },

  getAllSync: (query: string, params?: any[]) => {
    const q = String(query);
    if (q.includes("FROM offline_canteiros")) {
      return [...memoryTables.offline_canteiros].sort((a, b) => a.id - b.id);
    }
    if (q.includes("FROM offline_formularios")) {
      if (q.includes("WHERE id")) {
        const id = params?.[0];
        return memoryTables.offline_formularios.filter((r) => r.id === id);
      }
      return [...memoryTables.offline_formularios].sort((a, b) => a.id - b.id);
    }
    if (q.includes("FROM offline_formulario_photos")) {
      const fid = params?.[0];
      return memoryTables.offline_formulario_photos
        .filter((r) => r.formulario_local_id === fid)
        .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
    }
    if (q.includes("FROM profile_cache")) {
      if (q.includes("WHERE user_id")) {
        const uid = params?.[0];
        return memoryTables.profile_cache.filter((r) => r.user_id === uid);
      }
      return [...memoryTables.profile_cache];
    }
    if (q.includes("FROM plantas_cache")) {
      return [...memoryTables.plantas_cache];
    }
    if (q.includes("FROM api_cache")) {
      if (q.includes("WHERE cache_key")) {
        const key = params?.[0];
        return memoryTables.api_cache.filter((r) => r.cache_key === key);
      }
      return [...memoryTables.api_cache];
    }
    if (q.includes("FROM offline_mutations")) {
      if (q.includes("WHERE id")) {
        const id = params?.[0];
        return memoryTables.offline_mutations.filter((r) => r.id === id);
      }
      return [...memoryTables.offline_mutations].sort((a, b) => a.id - b.id);
    }
    return [];
  },

  runSync: (query: string, params: any[] = []) => {
    const q = String(query);
    if (q.trim().toUpperCase().startsWith("INSERT")) {
      if (q.includes("INTO auth")) return matchInsert("auth", q, params);
      if (q.includes("INTO profile_cache")) return matchInsert("profile_cache", q, params);
      if (q.includes("INTO plantas_cache")) return matchInsert("plantas_cache", q, params);
      if (q.includes("INTO api_cache")) return matchInsert("api_cache", q, params);
      if (q.includes("INTO offline_mutations")) return matchInsert("offline_mutations", q, params);
      if (q.includes("INTO offline_canteiros")) return matchInsert("offline_canteiros", q, params);
      if (q.includes("INTO offline_formularios")) return matchInsert("offline_formularios", q, params);
      if (q.includes("INTO offline_formulario_photos")) return matchInsert("offline_formulario_photos", q, params);
      return { lastInsertRowId: 0, changes: 0 };
    }
    if (q.trim().toUpperCase().startsWith("DELETE")) {
      if (q.includes("FROM auth")) {
        delete authStore[String(params[0])];
        return { changes: 1 };
      }
      if (q.includes("FROM offline_canteiros")) {
        const changes = memoryTables.offline_canteiros.length;
        memoryTables.offline_canteiros = [];
        return { changes };
      }
      if (q.includes("FROM offline_formulario_photos")) {
        if (q.includes("WHERE formulario_local_id")) {
          const fid = params[0];
          const before = memoryTables.offline_formulario_photos.length;
          memoryTables.offline_formulario_photos = memoryTables.offline_formulario_photos.filter((r) => r.formulario_local_id !== fid);
          return { changes: before - memoryTables.offline_formulario_photos.length };
        }
        const changes = memoryTables.offline_formulario_photos.length;
        memoryTables.offline_formulario_photos = [];
        return { changes };
      }
      if (q.includes("FROM offline_formularios")) {
        if (q.includes("WHERE id")) {
          const id = params[0];
          const before = memoryTables.offline_formularios.length;
          memoryTables.offline_formularios = memoryTables.offline_formularios.filter((r) => r.id !== id);
          memoryTables.offline_formulario_photos = memoryTables.offline_formulario_photos.filter((r) => r.formulario_local_id !== id);
          return { changes: before - memoryTables.offline_formularios.length };
        }
        const changes = memoryTables.offline_formularios.length;
        memoryTables.offline_formularios = [];
        return { changes };
      }
      if (q.includes("FROM profile_cache")) {
        if (q.includes("WHERE user_id")) {
          const uid = params[0];
          const before = memoryTables.profile_cache.length;
          memoryTables.profile_cache = memoryTables.profile_cache.filter((r) => r.user_id !== uid);
          return { changes: before - memoryTables.profile_cache.length };
        }
        const changes = memoryTables.profile_cache.length;
        memoryTables.profile_cache = [];
        return { changes };
      }
      if (q.includes("FROM plantas_cache")) {
        const changes = memoryTables.plantas_cache.length;
        memoryTables.plantas_cache = [];
        return { changes };
      }
      if (q.includes("FROM api_cache")) {
        if (q.includes("WHERE cache_key")) {
          const key = params[0];
          const before = memoryTables.api_cache.length;
          memoryTables.api_cache = memoryTables.api_cache.filter((r) => r.cache_key !== key);
          return { changes: before - memoryTables.api_cache.length };
        }
        const changes = memoryTables.api_cache.length;
        memoryTables.api_cache = [];
        return { changes };
      }
      if (q.includes("FROM offline_mutations")) {
        if (q.includes("WHERE id")) {
          const id = params[0];
          const before = memoryTables.offline_mutations.length;
          memoryTables.offline_mutations = memoryTables.offline_mutations.filter((r) => r.id !== id);
          return { changes: before - memoryTables.offline_mutations.length };
        }
        const changes = memoryTables.offline_mutations.length;
        memoryTables.offline_mutations = [];
        return { changes };
      }
    }
    return { changes: 0 };
  },

  // helper legado usado por auth.web antigo em algumas integrações
  setSync: (key: string, value: string) => {
    authStore[String(key)] = String(value);
  },
};

export function initDatabase() {}

export default db;