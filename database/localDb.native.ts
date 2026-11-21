import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('db.db');

export function initDatabase() {
    db.execSync(`
        CREATE TABLE IF NOT EXISTS auth (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS offline_canteiros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            payload_json TEXT NOT NULL,
            display_name TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS offline_formularios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            list_id TEXT NOT NULL,
            payload_json TEXT NOT NULL,
            title TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS offline_formulario_photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            formulario_local_id INTEGER NOT NULL,
            uri TEXT NOT NULL,
            mime_type TEXT NOT NULL,
            file_name TEXT NOT NULL,
            sort_order INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (formulario_local_id) REFERENCES offline_formularios(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS profile_cache (
            user_id TEXT PRIMARY KEY,
            data_json TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    `);
}

export default db;