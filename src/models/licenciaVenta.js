import { z } from 'zod';

class licenciaVenta{
    static propiedades = z.object({
        idLicVta: z.number().optional(),
        idProducto: z.number().nullish(),
        claveDigital: z.string().nullish(),
        claveUsada: z.boolean().default(false)
    })
    constructor(datos){
        const datosValidados = licenciaVenta.propiedades.parse(datos);

        Object.assign(this, datosValidados);
    }

    static fromRow(row){
        return new licenciaVenta({
            idLicVta: row.id_lic_vta,
            idProducto: row.id_producto,
            claveDigital: row.clave_digital,
            claveUsada: row.clave_usada === true
        });
    }
}

export { licenciaVenta }