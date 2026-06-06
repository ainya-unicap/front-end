function getStore() {
  return window.localStorage;
}

const db = {
  execSync: (query: string) => {
    // não precisa criar tabela na web
    return;
  },

  getFirstSync: (key: string) => {
    const value = getStore().getItem(key);
    return value ? { value } : null;
  },

  setSync: (key: string, value: string) => {
    getStore().setItem(key, value);
  },

  getAllSync: () => {
    return [];
  },

  runSync: () => {},
};

export function initDatabase() {}

export default db;