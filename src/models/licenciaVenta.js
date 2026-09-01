import { z } from 'zod';

class licenciaVenta{
    static propiedades = z.object({
        idLicVta: z.number().optional(),
        idProd: z.number().optional(),
        claveDigital: z.number().optional(),
        claveUsada: z.boolean().default(false)
    })
    constructor(datos){
        const datosValidados = licenciaVenta.propiedades.parse(datos);

        Object.assign(this, datosValidados);
    }
}

export { licenciaVenta }