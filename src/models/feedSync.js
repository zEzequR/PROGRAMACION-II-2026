import { z } from 'zod';

class ProductoFeed {
    static propiedades = z.object({
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

class InteresFeed {
    static propiedades = z.object({
        idPersona: z.number(),
        idCat: z.number()
    });

    constructor(datos) {
        const datosValidados = this.constructor.propiedades.parse(datos);
        Object.assign(this, datosValidados);
    }
}

export { ProductoFeed, InteresFeed }