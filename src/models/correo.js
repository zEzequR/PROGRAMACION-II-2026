import { z } from 'zod';

export class Correo {
    static propiedades = z.object({
        idTienda: z.number().optional(),
        from: z.string().optional(),
        to: z.union([z.email(), z.array(z.email())]).optional(),
        subject: z.string(),
        html: z.string().optional(),
        text: z.string().optional()
    });

    constructor(datos) {
        const datosValidados = Correo.propiedades.parse(datos);
        Object.assign(this, datosValidados);
    }
}