import express from 'express'
import rutaUsuarios from './routes/usuarios.js'
import rutaTiendas from './routes/tiendas.js'
import rutaProductos from './routes/productos.js'
import rutaPagos from './routes/pagos.js'

const app = express();

app.use(express.json());

app.use('/usuarios', rutaUsuarios);
app.use('/tiendas', rutaTiendas);
app.use('/productos', rutaProductos);
app.use('/pagos', rutaPagos);

export default app;