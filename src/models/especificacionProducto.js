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

    static fromRow(row)
    {
        return new EspecificacionProducto({
            idEspec: row.id_espec,
            idProducto: row.id_producto,
            idAtributo: row.id_atributo,
            valor: row.valor
        });
    }
}