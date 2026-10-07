import { z } from 'zod';
import { Tiendas } from './tiendas.js';
import { Productos } from './productos.js';
import { licenciaVenta } from './licenciaVenta.js';
import { Cliente } from './usuario.js';

class DetalleVenta {
    static propiedades = z.object({
        idVenta: z.number().optional(),
        idProducto: z.number(),
        precioUnitario: z.number().nonnegative().optional(),
        cantidad: z.number().int().positive().default(1),
        subtotal: z.number().optional(),
        producto: z.instanceof(Productos).optional(),
        licencia: z.instanceof(licenciaVenta).optional()
    });

    constructor(datos) {
        const datosValidados = this.constructor.propiedades.parse(datos);

        Object.assign(this, datosValidados);
    }

    static fromRow(row) {
        let licencia;
        if (row.id_lic_vta !== null)
        {
            licencia = licenciaVenta.fromRow(row);
        }

        return new DetalleVenta({
            idVenta: row.id_venta,
            idProducto: row.id_producto,
            precioUnitario: Number(row.precio_unitario),
            cantidad: row.cantidad,
            subtotal: Number(row.subtotal),
            producto: new Productos({
                idProducto: row.id_producto,
                tipoProd: row.tipo_prod,
                nombreProd: row.nombre_prod,
                imagenProd: row.imagen_prod
            }),
            licencia: licencia
        });
    }
}

class DetalleVentaDigital extends DetalleVenta {
    static propiedades = DetalleVenta.propiedades.extend({
        idLicVta: z.number().optional(),
    });

    constructor(datos) {
        super(datos)
    }
}

class Ventas {

    static propiedades = z.object({
        idVenta: z.number().optional(),
        fechaVenta: z.date().nullish(),
        idTienda: z.number().nullish(),
        idCliente: z.number().nullish(),
        precioFinal: z.number().optional(),
        estado: z.string().optional(),
        idPago: z.number().nullish(),
        idCuponDesc: z.number().nullish(),
        tienda: z.instanceof(Tiendas).optional(),
        cliente: z.instanceof(Cliente).optional(),
        items: z.array(z.instanceof(DetalleVenta)).optional()
    })

    constructor(datos) {
        const datosValidados = this.constructor.propiedades.parse(datos);

        Object.assign(this, datosValidados);
    }

    static fromRow(row, items) {
        let tienda;
        let cliente;

        if (row.email !== undefined)
        {
            cliente = new Cliente({
                idCliente: row.id_cliente,
                idPersona: row.id_persona,
                email: row.email,
                nombre: row.nombre,
                apellido: row.apellido
            });
        }
        if (row.nombre_tienda !== undefined)
        {
            tienda = new Tiendas({
                idTienda: row.id_tienda,
                nombreTienda: row.nombre_tienda,
                logoTienda: row.logo_tienda
            });
        }

        return new Ventas({
            idVenta: row.id_venta,
            fechaVenta: row.fecha_venta,
            idTienda: row.id_tienda,
            idCliente: row.id_cliente,
            precioFinal: Number(row.precio_final),
            estado: row.estado,
            idPago: row.id_pago,
            idCuponDesc: row.id_cupon_desc,
            tienda: tienda,
            cliente: cliente,
            items: items
        });
    }
}

export { Ventas, DetalleVenta, DetalleVentaDigital };