import { z } from 'zod';

export class Tiendas {

    static propiedades = z.object({
        idTienda: z.number().nullish(),
        idEmprendedor: z.number().nullish(),
        nombreTienda: z.string().nullish(),
        logoTienda: z.string().nullish(),
        fechaCreacion: z.date().nullish(),
        activo: z.boolean().default(true).optional()
    })
    constructor(datos) {
        const datosValidados = Tiendas.propiedades.parse(datos);

        Object.assign(this, datosValidados);
    }

    static fromRow(row) {
        return new Tiendas({
            idTienda: row.id_tienda,
            idEmprendedor: row.id_emprendedor,
            nombreTienda: row.nombre_tienda,
            logoTienda: row.logo_tienda,
            fechaCreacion: row.fecha_creacion,
            activo: row.activo === true
        });
    }
}

