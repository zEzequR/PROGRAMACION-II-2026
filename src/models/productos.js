import { z } from 'zod';
import { Tiendas } from './tiendas.js';
import { Categoria } from './categorias.js';

class Productos {
    static propiedades = z.object({
        idProducto: z.number().optional(),
        idTienda: z.number().nullish(),
        idCat: z.number().nullish(),
        tipoProd: z.string().optional(),
        nombreProd: z.string().optional(),
        imagenProd: z.string().optional(),
        descripProd: z.string().nullish(),
        precio: z.number().optional(),
        activo: z.boolean().optional(),
        tienda: z.instanceof(Tiendas).optional(),
        categoria: z.instanceof(Categoria).optional()
    });

    constructor(datos) {
        const datosValidados = this.constructor.propiedades.parse(datos);
        Object.assign(this, datosValidados);
    }

    static fromRow(row) {
        const datos = {
            idProducto: row.id_producto,
            idTienda: row.id_tienda,
            idCat: row.id_cat,
            tipoProd: row.tipo_prod,
            nombreProd: row.nombre_prod,
            imagenProd: row.imagen_prod,
            descripProd: row.descrip_prod,
            precio: Number(row.precio),
            activo: row.activo === true
        };

        const datosTienda = {
            idTienda: row.id_tienda,
            nombreTienda: row.nombre_tienda,
            logoTienda: row.logo_tienda
        };
        if (row.tienda_activa !== undefined)
        {
            datosTienda.activo = row.tienda_activa === true;
        }
        datos.tienda = new Tiendas(datosTienda);

        if (row.id_cat !== null)
        {
            datos.categoria = Categoria.fromRow(row);
        }

        if (row.tipo_prod === 'FISICO')
        {
            datos.stock = row.stock;
            return new ProductosFisicos(datos);
        }

        datos.usaLicencia = row.usa_licencia;
        return new ProductosDigitales(datos);
    }
}


class ProductosDigitales extends Productos {
    static propiedades = Productos.propiedades.extend({
        archivoProd: z.string().optional(),
        usaLicencia: z.boolean().nullish()
    });

    constructor(datos) {
        super(datos)
    }
}

class ProductosFisicos extends Productos {
    static propiedades = Productos.propiedades.extend({
        stock: z.number().nullish()
    });

    constructor(datos) {
        super(datos)
    }
}

export { Productos, ProductosDigitales, ProductosFisicos }