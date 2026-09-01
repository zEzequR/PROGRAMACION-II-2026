import { z } from 'zod';

class Usuario {
    static propiedades = z.object({
        idPersona: z.number().optional(),
        email: z.email().optional(),
        psw: z.string().optional(),
        tipoAuth: z.string().optional(),
        nombre: z.string().optional(),
        apellido: z.string().optional(),
        telefono: z.string().optional(),
        idUbicacion: z.number().optional(),
        idCat: z.number().optional(),
        activo: z.boolean().default(true),
        fechaBaja: z.date().optional(),
        fechaCreacion: z.date().optional()
    });

    constructor(datos) {
        const datosValidados = this.constructor.propiedades.parse(datos);
        Object.assign(this, datosValidados);
    }
}

class Emprendedor extends Usuario {
    static propiedades = Usuario.propiedades.extend({
        idEmprendedor: z.number().optional(),
        cuit: z.string().optional(),
        mpAccessToken: z.string().optional()
    });

    constructor(datos) {
        super(datos);
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