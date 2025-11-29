const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const videosRouter = require('./routes/videos');


const app = express();
const PORT = process.env.PORT || 3000;


// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Carpeta uploads - exponer para streaming/download
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// rutas
app.use('/videos', videosRouter);


// Health
app.get('/', (req, res) => res.send('Servidor de videos públicos activo'));


// ensure folders exist
fs.ensureDirSync(path.join(__dirname, 'uploads'));
fs.ensureDirSync(path.join(__dirname, 'data'));
const dataFile = path.join(__dirname, 'data', 'videos.json');
if (!fs.existsSync(dataFile)) fs.writeJsonSync(dataFile, []);


app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));