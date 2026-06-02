import express from 'express' //express()` crea una instancia de aplicación.
import rutaUsuarios from './routes/usuarios.js'
import rutaTiendas from './routes/tiendas.js'
import rutaPagos from './routes/pagos.js'
import rutaProductos from './routes/productos.js'
import rutaCupones from './routes/cuponesDescuento.js'
import rutaCategorias from './routes/categorias.js'
import rutaClientes from './routes/clientes.js'
import rutaVentas from './routes/ventas.js'
import rutaEmprendedores from './routes/emprendedores.js'
import rutaBilleteras from './routes/billeteras.js'
import rutaTarjetas from './routes/tarjetas.js'

const app = express(); //app.listen()` inicia el servidor HTTP.

app.use(express.json());

app.use('/usuarios', rutaUsuarios);
app.use('/tiendas', rutaTiendas);
app.use('/pagos', rutaPagos);
app.use('/billeteras', rutaBilleteras);
app.use('/tarjetas', rutaTarjetas);
app.use('/productos', rutaProductos);
app.use('/cupones', rutaCupones);
app.use('/categorias', rutaCategorias);
app.use('/clientes', rutaClientes);
app.use('/ventas', rutaVentas);
app.use('/emprendedores', rutaEmprendedores);

export default app;