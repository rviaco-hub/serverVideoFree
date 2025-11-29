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

module.exports = router;

