import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

const location = process.env.SQLITE_DB_LOCATION || '/tmp/todo.db';

let db: sqlite3.Database;

async function init(): Promise<void> {
    const dirName = path.dirname(location);
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(location, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) return reject(err);

            if (process.env.NODE_ENV !== 'test') {
                console.log(`Using sqlite database at ${location}`);
            }

            db.run(
                'CREATE TABLE IF NOT EXISTS todo_items (id TEXT PRIMARY KEY, name TEXT, completed INTEGER)',
                (err) => {
                    if (err) return reject(err);
                    resolve();
                },
            );
        });
    });
}

async function teardown(): Promise<void> {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

async function getItems(): Promise<{ id: string; name: string; completed: boolean }[]> {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM todo_items', (err, rows) => {
            if (err) return reject(err);
            resolve(rows.map((item: any) => ({
                id: item.id,
                name: item.name,
                completed: item.completed === 1,
            })));
        });
    });
}

async function getItem(id: string): Promise<{ id: string; name: string; completed: boolean } | null> {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM todo_items WHERE id = ?', [id], (err, rows) => {
            if (err) return reject(err);
            const item = rows.map((item: any) => ({
                id: item.id,
                name: item.name,
                completed: item.completed === 1,
            }))[0] || null;
            resolve(item);
        });
    });
}

async function storeItem(item: { id: string; name: string; completed: boolean }): Promise<void> {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO todo_items (id, name, completed) VALUES (?, ?, ?)',
            [item.id, item.name, item.completed ? 1 : 0],
            (err) => {
                if (err) return reject(err);
                resolve();
            },
        );
    });
}

async function updateItem(id: string, item: { name: string; completed: boolean }): Promise<void> {
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE todo_items SET name = ?, completed = ? WHERE id = ?',
            [item.name, item.completed ? 1 : 0, id],
            (err) => {
                if (err) return reject(err);
                resolve();
            },
        );
    });
}

async function removeItem(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM todo_items WHERE id = ?', [id], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

export {
    init,
    teardown,
    getItems,
    getItem,
    storeItem,
    updateItem,
    removeItem,
};
