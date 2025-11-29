const path = require('path');
const fs = require('fs-extra');
const dataFile = path.join(__dirname, '..', 'data', 'videos.json');


async function readAll() {
    try {
        const items = await fs.readJson(dataFile);
        return items || [];
    } catch (err) {
        return [];
    }
}


async function writeAll(items) {
    await fs.writeJson(dataFile, items, { spaces: 2 });
}


module.exports = {
    getAll: async () => await readAll(),
    getById: async (id) => {
        const items = await readAll();
        return items.find(i => i.id === id) || null;
    },
    create: async (video) => {
        const items = await readAll();
        items.push(video);
        await writeAll(items);
        return video;
    },
    updateById: async (id, newObj) => {
        const items = await readAll();
        const idx = items.findIndex(i => i.id === id);
        if (idx === -1) return null;
        items[idx] = newObj;
        await writeAll(items);
        return newObj;
    },
    deleteById: async (id) => {
        let items = await readAll();
        items = items.filter(i => i.id !== id);
        await writeAll(items);
        return true;
    }
};