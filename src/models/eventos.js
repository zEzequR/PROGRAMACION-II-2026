import { z } from 'zod';

class InteraccionEvento {
    static propiedades = z.object({
        idPersona: z.number(),
        idProducto: z.number(),
        tipoEvento: z.enum(['Detalle', 'VisitaTienda', 'Carrito', 'Compra'])
    });

    constructor(datos) {
        const datosValidados = this.constructor.propiedades.parse(datos);
        Object.assign(this, datosValidados);
    }
}

class SyncProductoEvento {
    static propiedades = z.object({
        tipo: z.literal('producto'),
        idProducto: z.number(),
        idCat: z.number(),
        idTienda: z.number(),
        activo: z.boolean()
    });

    constructor(datos) {
        const datosValidados = this.constructor.propiedades.parse(datos);
        Object.assign(this, datosValidados);
    }
}

class SyncInteresEvento {
    static propiedades = z.object({
        tipo: z.literal('interes'),
        idPersona: z.number(),
        idCat: z.number(),
        accion: z.enum(['agregar', 'eliminar'])
    });

    constructor(datos) {
        const datosValidados = this.constructor.propiedades.parse(datos);
        Object.assign(this, datosValidados);
    }
}

export { InteraccionEvento, SyncProductoEvento, SyncInteresEvento }