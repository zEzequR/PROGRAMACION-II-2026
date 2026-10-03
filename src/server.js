import https from 'https'
import fs from 'fs'
import app from './app.js'
import { iniciarFeed } from './services/feedSyncService.js'

const options = {
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.crt'),
    minVersion: 'TLSv1.2',
};

https.createServer(options, app).listen(443, () => {
    console.log('Servidor HTTPS escuchando en puerto 443');
    iniciarFeed();
})