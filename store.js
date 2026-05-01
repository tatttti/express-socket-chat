import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'db.json');

async function readDB() {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
}

async function writeDB(data) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getAll() {
    return await readDB();
}

export async function getById(id) {
    const items = await readDB();
    return items.find(item => Number(item.id) === Number(id));
}

export async function create(item) {
    const items = await readDB();
    items.push(item);
    await writeDB(items);
    return item;
}

export async function updateById(id, updated) {
    const items = await readDB();
    const index = items.findIndex(item => Number(item.id) === Number(id));

    if (index === -1) {
        return null;
    }

    items[index] = { ...items[index], ...updated };
    await writeDB(items);
    return items[index];
}

export async function deleteById(id) {
    const items = await readDB();
    const filtered = items.filter(item => Number(item.id) !== Number(id));
    await writeDB(filtered);
    return items.length !== filtered.length;
}
