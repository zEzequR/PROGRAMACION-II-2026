import { z } from 'zod';

export class SugerenciaProducto
{
    static propiedades = z.object({
        nombreProd: z.string().trim().min(1).max(60),
        descripProd: z.string().trim().min(1).max(255),
        nombreAtributo: z.string().trim().min(1).max(60),
        valor: z.string().trim().min(1).max(60)
    });

    constructor(datos)
    {
        const datosValidados = SugerenciaProducto.propiedades.parse(datos);
        Object.assign(this, datosValidados);
    }

    static fromMcp(datos)
    {
        return new SugerenciaProducto({
            nombreProd: datos.nombre_prod,
            descripProd: datos.descrip_prod,
            nombreAtributo: datos.nombre_atributo,
            valor: datos.valor
        });
    }
}
