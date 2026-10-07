import { z } from 'zod';

class Categoria{
    static propiedades = z.object({
        idCategoria: z.number().optional(),
        categoria: z.string().nullish()
    });


    constructor(datos)
    {
        const datosValidados = Categoria.propiedades.parse(datos);
        Object.assign(this, datosValidados);
    }

    static fromRow(row)
    {
        return new Categoria({
            idCategoria: row.id_cat,
            categoria: row.categoria
        });
    }
}

export { Categoria };