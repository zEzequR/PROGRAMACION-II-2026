import { z } from 'zod';

export class cuponesDescuentos {
    static propiedades = z.object({
        idCuponDesc: z.number().optional(),
        idTienda: z.number().optional(),
        codigo: z.string().optional(),
        tipoDescuento: z.string().optional(),
        valor: z.number().optional(),
        fechaExpiracion: z.string().nullish(),
        usosMaximos: z.number().nullish(),
        usosActuales: z.number().default(0).optional(),
        aplicaTienda: z.boolean().optional(),
        vencido: z.boolean().optional()
    });

    constructor(datos) {
        const datosValidados = this.constructor.propiedades.parse(datos);
        Object.assign(this, datosValidados);
    }

    static fromRow(row) {
        let fechaExpiracion = row.fecha_expiracion;
        if (fechaExpiracion instanceof Date)
        {
            fechaExpiracion = fechaExpiracion.toLocaleDateString('sv-SE');
        }

        return new cuponesDescuentos({
            idCuponDesc: row.id_cupon_desc,
            idTienda: row.id_tienda,
            codigo: row.codigo,
            tipoDescuento: row.tipo,
            valor: Number(row.valor),
            fechaExpiracion: fechaExpiracion,
            usosMaximos: row.usos_maximos,
            usosActuales: Number(row.usos_actuales),
            vencido: row.vencido
        });
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