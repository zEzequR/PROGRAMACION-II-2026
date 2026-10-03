import { z } from 'zod';

export class AtributoCategoria{
    static propiedades = z.object({
        idAtributo: z.number().optional(),
        idCat: z.number().optional(),
        nombreAtributo: z.string().optional()
    });
    
    constructor(datos)
    {
        const datosValidados = AtributoCategoria.propiedades.parse(datos);
        Object.assign(this, datosValidados);
    }
}