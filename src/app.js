import express from 'express'
import rutaUsuarios from './routes/usuarios.js'
import rutaTiendas from './routes/tiendas.js'
import rutaProductos from './routes/productos.js'
import rutaPagos from './routes/pagos.js'
import rutaCupones from './routes/cupones.js'
import rutaVentas from './routes/ventas.js'
import rutaUbicaciones from './routes/ubicaciones.js'
import rutaEmails from './routes/emails.js';
import rutaCategorias from './routes/categorias.js';
import rutaLicencias from './routes/licencias.js';
import rutaMercadoPago from './routes/mercadopago.js';
import rutaFeed from './routes/feed.js';
import rutaTracking from './routes/tracking.js';

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.use('/usuarios', rutaUsuarios);
app.use('/tiendas', rutaTiendas);
app.use('/productos', rutaProductos);
app.use('/pagos', rutaPagos);
app.use('/cupones', rutaCupones);
app.use('/ventas', rutaVentas);
app.use('/ubicaciones', rutaUbicaciones);
app.use('/emails', rutaEmails);
app.use('/categorias', rutaCategorias);
app.use('/licencias', rutaLicencias);
app.use('/mercadopago', rutaMercadoPago);
app.use('/feed', rutaFeed);
app.use('/tracking', rutaTracking);

export default app;