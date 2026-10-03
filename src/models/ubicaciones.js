import { z } from 'zod';

class Ubicaciones{
    static propiedades = z.object(
        {
            idUbicacion: z.number().optional(),
            direccion: z.string().optional(),  
            piso: z.string().optional(),
            depto: z.string().optional(),
            pais: z.string().optional(),
            provincia: z.string().optional(),
            ciudad: z.string().optional(),
            codigo: z.string().optional(),
            placeid: z.string().optional()
        });
    constructor(datos){
        const datosValidados = Ubicaciones.propiedades.parse(datos);

        Object.assign(this, datosValidados);
    }
}

export { Ubicaciones }