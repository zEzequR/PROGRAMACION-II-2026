import { z } from 'zod';

class Ubicaciones{
    static propiedades = z.object(
        {
            idUbicacion: z.number().optional(),
            direccion: z.string().nullish(),
            piso: z.string().nullish(),
            depto: z.string().nullish(),
            pais: z.string().nullish(),
            provincia: z.string().nullish(),
            ciudad: z.string().nullish(),
            codigo: z.string().nullish(),
            placeid: z.string().nullish()
        });
    constructor(datos){
        const datosValidados = Ubicaciones.propiedades.parse(datos);

        Object.assign(this, datosValidados);
    }

    static fromRow(row){
        return new Ubicaciones({
            idUbicacion: row.id_ubicacion,
            direccion: row.direccion,
            piso: row.piso,
            depto: row.depto,
            pais: row.pais,
            provincia: row.provincia,
            ciudad: row.ciudad,
            codigo: row.codigo,
            placeid: row.placeid
        });
    }
}

export { Ubicaciones }