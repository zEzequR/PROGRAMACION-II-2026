import { z } from 'zod';

export class cuponesDescuentos {
    static propiedades = z.object({
        idCuponDesc: z.number().optional(),
        idTienda: z.number().optional(),
        codigo: z.string().optional(),
        tipoDescuento: z.string().optional(),
        valor: z.number().optional(),
        fechaExpiracion: z.string().optional(),
        usosMaximos: z.number().optional(),
        usosActuales: z.number().default(0).optional(),
        aplicaTienda: z.boolean().optional()
    });

    constructor(datos) {
        const datosValidados = this.constructor.propiedades.parse(datos);
        Object.assign(this, datosValidados);
    }
}

export class cuponesDescuentosProductos extends cuponesDescuentos {
    static propiedades = cuponesDescuentos.propiedades.extend({
        idProductos: z.array(z.number()).optional()
    });

    constructor(datos) {
        super(datos);
    }
}