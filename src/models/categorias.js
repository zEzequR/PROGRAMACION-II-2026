import { z } from 'zod';

class Categoria{
    static propiedades = z.object({
        idCategoria: z.number().optional(),
        categoria: z.string().optional()
    });

    
    constructor(datos)
    {
        const datosValidados = Categoria.propiedades.parse(datos);
        Object.assign(this, datosValidados);
    }
}

export { Categoria };