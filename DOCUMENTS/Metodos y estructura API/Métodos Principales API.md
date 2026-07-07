# ***Auth***

| Método                     | Código HTTP |
| -------------------------- | ----------- |
| registrarseManual(...)     | POST        |
| registrarseGoogle(...)     | POST        |
| loggearseManual(...)       | POST        |
| loggearseGoogle(...)       | POST        |
| cerrarSesion(...)          | DELETE      |

___

# ***Emprendedor***

| Método                     | Código HTTP |
| -------------------------- | ----------- |
| crearEmprendedor(...)      | POST        |
| modificarDatosUsuario(...) | PUT         |

___

# ***Tienda***

| Método                    | Código HTTP |
| ------------------------- | ----------- |
| crearTienda(...)          | POST        |
| modificarTienda(...)      | PUT         |
| eliminarTienda(...)       | DELETE      |
| crearCategoria(...)       | POST        |
| obtenerCategorias(...)    | GET         |

___

# ***Productos***

| Método                   | Código HTTP |
| ------------------------ | ----------- |
| crearProd(...)           | POST        |
| modificarProd(...)       | PUT         |
| eliminarProd(...)        | DELETE      |
| obtenerInfoProd(...)     | GET         |
| verificarKeyDigital(...) | POST        |

___

# ***Códigos de Descuento***

| Método                | Código HTTP |
| --------------------- | ----------- |
| crearCodDesc(...)     | POST        |
| modificarCodDesc(...) | PUT         |
| eliminarCodDesc(...)  | DELETE      |

___

# ***Clientes***

| Método                     | Código HTTP |
| -------------------------- | ----------- |
| crearCliente(...)          | POST        |
| obtenerClientes(...)       | GET         |
| modificarDatosUsuario(...) | PUT         |
| agregarTarjeta(...)        | POST        |
| eliminarTarjeta(...)       | DELETE      |
| obtenerTarjetas(...)       | GET         |

___

# ***Checkout***

| Método                       | Código HTTP |
| ---------------------------- | ----------- |
| crearVenta(...)              | POST        |
| obtenerVentas(...)           | GET         |
| obtenerDetalleVenta(...)     | GET         |
| realizarPago(...)            | POST        |
| agregarDatosPagoCliente(...) | POST        |
| aplicarDescPago(...)         | POST        |

___

# ***Pagos***

| Método                    | Código HTTP |
| ------------------------- | ----------- |
| agregarFuenteIngreso(...) | POST        |
| obtenerDetallesPago(...)  | GET         |