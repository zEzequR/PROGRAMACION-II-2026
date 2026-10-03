import { z } from 'zod';

class Ventas {

    static propiedades = z.object({
        idVenta: z.number().optional(),
        fechaVenta: z.date().optional(),
        idTienda: z.number().optional(),
        idCliente: z.number().optional(),
        precioFinal: z.number().optional(),
        estado: z.string().optional(),
        idPago: z.number().optional(),
        idCuponDesc: z.number().optional()
    })

    constructor(datos) {
        const datosValidados = this.constructor.propiedades.parse(datos);

        Object.assign(this, datosValidados);
    }
}

class DetalleVenta {
    static propiedades = z.object({
        idVenta: z.number().optional(),
        idProducto: z.number(),
        precioUnitario: z.number().positive().optional(),
        cantidad: z.number().int().positive().default(1),
        subtotal: z.number().optional()
    });

    constructor(datos) {
        const datosValidados = this.constructor.propiedades.parse(datos);

        Object.assign(this, datosValidados);
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

export { Ventas, DetalleVenta, DetalleVentaDigital };