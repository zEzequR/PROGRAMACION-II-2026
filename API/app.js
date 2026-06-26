import express from 'express' //express()` crea una instancia de aplicación.
import rutaUsuarios from './routes/usuarios.js'

const app = express(); //app.listen()` inicia el servidor HTTP.

app.use(express.json());

app.use('/usuarios', rutaUsuarios);

export default app;