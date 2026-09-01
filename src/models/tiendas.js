import { z } from 'zod';

export class Tiendas {

    static propiedades = z.object({
        idTienda: z.number().optional(),
        idEmprendedor: z.number().optional(),
        idPlantilla: z.number().optional(),
        nombreTienda: z.string().optional(),
        logoTienda: z.string().optional(),
        personalizacionTienda: z.any().optional(),
        activo: z.boolean().default(true).optional()
    })
    constructor(datos) {
        const datosValidados = Tiendas.propiedades.parse(datos);
        
        Object.assign(this, datosValidados);
    }
}