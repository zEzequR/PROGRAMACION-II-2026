import express from 'express' //express()` crea una instancia de aplicación.
import rutaUsuarios from './routes/usuarios.js'
import rutaTiendas from './routes/tiendas.js'
import rutaProductos from './routes/productos.js'

const app = express(); //app.listen()` inicia el servidor HTTP.

app.use(express.json());

app.use('/usuarios', rutaUsuarios);
app.use('/tiendas', rutaTiendas);
app.use('/productos', rutaProductos);

export default app;