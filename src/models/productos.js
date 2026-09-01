import { z } from 'zod';

class Productos {
    static propiedades = z.object({
        idProducto: z.number().optional(),
        idTienda: z.number().optional(),
        idCat: z.number().optional(),
        tipoProd: z.string().optional(),
        nombreProd: z.string().optional(),
        imagenProd: z.string().optional(),
        descripProd: z.string().optional(),
        precio: z.number().optional(),
        activo: z.boolean().default(true)
    });

    constructor(datos) {
        const datosValidados = this.constructor.propiedades.parse(datos);
        Object.assign(this, datosValidados);
    }
}

class ProductosDigitales extends Productos {
    static propiedades = Productos.propiedades.extend({
        archivoProd: z.string().optional(),
        usaLicencia: z.boolean().optional()
    });

    constructor(datos) {
        super(datos)
    }
}

class ProductosFisicos extends Productos {
    static propiedades = Productos.propiedades.extend({
        stock: z.number().optional()
    });

    constructor(datos) {

        super(datos)
    }
}

export { Productos, ProductosDigitales, ProductosFisicos }