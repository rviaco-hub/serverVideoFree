const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const model = require('../models/videoModel');


const uploadsDir = path.join(__dirname, '..', 'uploads');


// List all videos metadata
exports.list = async (req, res) => {
    const items = await model.getAll();
    res.json(items);
};


exports.getOne = async (req, res) => {
    const id = req.params.id;
    const video = await model.getById(id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json(video);
};


exports.streamFile = async (req, res) => {
    const id = req.params.id;
    const video = await model.getById(id);
    if (!video) return res.status(404).json({ message: 'Video not found' });


    const filePath = path.join(uploadsDir, video.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });


    // Soporta streaming por rango
    const stat = await fs.stat(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;


    if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': video.mimetype || 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': video.mimetype || 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
    }
};


exports.create = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No se subió archivo' });
        const { title = '', description = '' } = req.body;


        const newVideo = {
            id: uuidv4(),
            title,
            description,
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            createdAt: new Date().toISOString(),
        };


        await model.create(newVideo);
        res.status(201).json(newVideo);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al crear video' });
    }
};


exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const existing = await model.getById(id);
        if (!existing) return res.status(404).json({ message: 'Video not found' });


        // actualizar metadata
        const { title, description } = req.body;
        const updated = { ...existing };
        if (title !== undefined) updated.title = title;
        if (description !== undefined) updated.description = description;


        // si viene un nuevo archivo, reemplazar
        if (req.file) {
            // borrar archivo antiguo
            const oldPath = path.join(uploadsDir, existing.filename);
            if (fs.existsSync(oldPath)) await fs.remove(oldPath);


            updated.filename = req.file.filename;
            updated.originalname = req.file.originalname;
            updated.mimetype = req.file.mimetype;
            updated.size = req.file.size;
        }


        updated.updatedAt = new Date().toISOString();


        await model.updateById(id, updated);
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al actualizar video' });
    }
};


exports.remove = async (req, res) => {
    try {
        const id = req.params.id;
        const existing = await model.getById(id);
        if (!existing) return res.status(404).json({ message: 'Video not found' });


        // borrar archivo físico
        const filePath = path.join(uploadsDir, existing.filename);
        if (fs.existsSync(filePath)) await fs.remove(filePath);


        await model.deleteById(id);
        res.json({ message: 'Video eliminado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al eliminar video' });
    }
};