import { z } from 'zod';

export class Filtros {
    static propiedades = z.object({
        busqueda: z.string().optional(),
        idCat: z.number().optional(),
        total: z.number().optional(),
        offset: z.number().optional(),
        desde: z.string().optional(),
        hasta: z.string().optional()
    });

    constructor(datos) {
        const datosValidados = Filtros.propiedades.parse(datos);
        Object.assign(this, datosValidados);
    }
}
