const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const videosController = require('../controllers/videosController');

// multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: function (req, file, cb) {
        // keep original extension
        const ext = path.extname(file.originalname);
        const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, name);
    }
});


const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } }); // límite 500MB


// Rutas CRUD
router.get('/', videosController.list);
router.get('/:id', videosController.getOne);
router.get('/:id/file', videosController.streamFile);
router.post('/', upload.single('file'), videosController.create);
router.put('/:id', upload.single('file'), videosController.update);
router.delete('/:id', videosController.remove);

// 🚀 STREAM REAL
router.get('/file/:id', async (req, res) => {
    try {
        const video = await videosController.findById(req.params.id);

        if (!video || !video.filename) {
            return res.status(404).send('Video not found');
        }

        const filePath = path.join(__dirname, '..', 'uploads', video.filename);

        // verificar que existe
        if (!fs.existsSync(filePath)) {
            return res.status(404).send('Physical file not found');
        }

        res.writeHead(200, {
            "Content-Type": "video/mp4",
        });

        fs.createReadStream(filePath).pipe(res);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


module.exports = router;

