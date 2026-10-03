import { z } from 'zod';

export class EspecificacionProducto
{
    static propiedades = z.object({
        idEspec: z.number().optional(),
        idProducto: z.number().optional(),
        idAtributo: z.number().optional(),
        valor: z.string().optional()
    });

    constructor(datos)
    {
        const datosValidados = EspecificacionProducto.propiedades.parse(datos);
        Object.assign(this, datosValidados);
    }
}