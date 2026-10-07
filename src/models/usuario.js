import { z } from 'zod';
import { Ubicaciones } from './ubicaciones.js';

class Usuario {
    static propiedades = z.object({
        idPersona: z.number().optional(),
        email: z.email().optional(),
        psw: z.string().nullish(),
        tipoAuth: z.string().optional(),
        nombre: z.string().optional(),
        apellido: z.string().optional(),
        telefono: z.string().nullish(),
        idUbicacion: z.number().nullish(),
        activo: z.boolean().default(true),
        fechaBaja: z.date().nullish(),
        fechaCreacion: z.date().optional(),
        ubicacion: z.instanceof(Ubicaciones).optional()
    });

    constructor(datos) {
        const datosValidados = this.constructor.propiedades.parse(datos);
        Object.assign(this, datosValidados);
    }

    static fromRow(row) {
        let ubicacion;
        if (row.id_ubicacion !== null && row.direccion !== undefined)
        {
            ubicacion = Ubicaciones.fromRow(row);
        }

        return new Usuario({
            idPersona: row.id_persona,
            email: row.email,
            psw: row.psw,
            tipoAuth: row.tipo_auth,
            nombre: row.nombre,
            apellido: row.apellido,
            telefono: row.telefono,
            idUbicacion: row.id_ubicacion,
            activo: row.activo === true,
            fechaBaja: row.fecha_baja,
            fechaCreacion: row.fecha_creacion,
            ubicacion: ubicacion
        });
    }

}


class Emprendedor extends Usuario {
    static propiedades = Usuario.propiedades.extend({
        idEmprendedor: z.number().optional(),
        cuit: z.string().nullish(),
        mpAccessToken: z.string().nullish(),
        mpRefreshToken: z.string().nullish(),
        mpUserId: z.string().nullish(),
        mpPublicKey: z.string().nullish(),
        mpTokenExpiresAt: z.date().nullish(),
        mpQrAccessToken: z.string().nullish(),
        mpQrRefreshToken: z.string().nullish(),
        mpQrUserId: z.string().nullish(),
        mpQrTokenExpiresAt: z.date().nullish(),
        mpQrStoreId: z.string().nullish(),
        mpQrPosId: z.string().nullish()
    });

    constructor(datos) {
        super(datos);
    }

    static fromRow(row) {
        return new Emprendedor({
            idEmprendedor: row.id_emprendedor,
            idPersona: row.id_persona,
            cuit: row.cuit,
            mpAccessToken: row.mp_access_token,
            mpRefreshToken: row.mp_refresh_token,
            mpUserId: row.mp_user_id,
            mpPublicKey: row.mp_public_key,
            mpTokenExpiresAt: row.mp_token_expires_at,
            mpQrAccessToken: row.mp_qr_access_token,
            mpQrRefreshToken: row.mp_qr_refresh_token,
            mpQrUserId: row.mp_qr_user_id,
            mpQrTokenExpiresAt: row.mp_qr_token_expires_at,
            mpQrStoreId: row.mp_qr_store_id,
            mpQrPosId: row.mp_qr_pos_id
        });
    }
}

class Cliente extends Usuario {
    static propiedades = Usuario.propiedades.extend({
        idCliente: z.number().optional(),
        id_tienda: z.number().optional(),
        suscripcion: z.boolean().optional(),
        resendContactID: z.string().optional()
    });

    constructor(datos) {
        super(datos);
    }
}


export { Usuario, Emprendedor, Cliente };