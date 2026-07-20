import express from 'express'
import rutaUsuarios from './routes/usuarios.js'
import rutaTiendas from './routes/tiendas.js'
import rutaProductos from './routes/productos.js'
import rutaPagos from './routes/pagos.js'
import rutaCupones from './routes/cupones.js'
import rutaVentas from './routes/ventas.js'
import rutaDetalleVenta from './routes/detalleVenta.js'

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.use('/usuarios', rutaUsuarios);
app.use('/tiendas', rutaTiendas);
app.use('/productos', rutaProductos);
app.use('/pagos', rutaPagos);
app.use('/cupones', rutaCupones);
app.use('/ventas', rutaVentas);
app.use('/detalle-venta', rutaDetalleVenta);

export default app;