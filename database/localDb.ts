import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('db.db');

export function initDatabase() {
    db.execSync(`
        CREATE TABLE IF NOT EXISTS auth (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
    `);
}

export default db;