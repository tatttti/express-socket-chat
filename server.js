import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { app as restApp } from './rest.js';
import { initSocket } from './socket.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = restApp;

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: path.join(__dirname, 'public')});
});

app.get('/chat', (req, res) => {
    res.render('chat');
});

const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Express и Socket.IO запущен на  ${process.env.PORT || 3000}`)
})

initSocket(server);