import { z } from 'zod';

function atributoCompleto(datos)
{
    if (datos.nombreAtributo === undefined && datos.valor === undefined)
    {
        return true;
    }
    return datos.nombreAtributo !== undefined && datos.valor !== undefined;
}

const bodyCrearFisico = z.object({
    tipoProd: z.literal('FISICO').default('FISICO'),
    idCat: z.coerce.number().int().positive(),
    nombreProd: z.string().trim().min(1).max(60),
    descripProd: z.string().trim().max(255).optional(),
    precio: z.coerce.number().nonnegative(),
    activo: z.union([z.boolean(), z.stringbool()]).default(true),
    stock: z.coerce.number().int().nonnegative(),
    nombreAtributo: z.string().trim().min(1).max(60),
    valor: z.string().trim().min(1).max(60)
});

const bodyCrearDigital = z.object({
    tipoProd: z.literal('DIGITAL').default('DIGITAL'),
    idCat: z.coerce.number().int().positive(),
    nombreProd: z.string().trim().min(1).max(60),
    descripProd: z.string().trim().max(255).optional(),
    precio: z.coerce.number().nonnegative(),
    activo: z.union([z.boolean(), z.stringbool()]).default(true),
    usaLicencia: z.union([z.boolean(), z.stringbool()]).default(false),
    nombreAtributo: z.string().trim().min(1).max(60),
    valor: z.string().trim().min(1).max(60)
});

const bodyModificarFisico = z.object({
    tipoProd: z.literal('FISICO').default('FISICO'),
    idCat: z.coerce.number().int().positive().optional(),
    nombreProd: z.string().trim().min(1).max(60).optional(),
    imagenProd: z.string().trim().min(1).optional(),
    descripProd: z.string().trim().max(255).optional(),
    precio: z.coerce.number().nonnegative().optional(),
    activo: z.union([z.boolean(), z.stringbool()]).optional(),
    stock: z.coerce.number().int().nonnegative().optional(),
    nombreAtributo: z.string().trim().min(1).max(60).optional(),
    valor: z.string().trim().min(1).max(60).optional()
}).refine(atributoCompleto, { path: ['valor'] });

const bodyModificarDigital = z.object({
    tipoProd: z.literal('DIGITAL').default('DIGITAL'),
    idCat: z.coerce.number().int().positive().optional(),
    nombreProd: z.string().trim().min(1).max(60).optional(),
    imagenProd: z.string().trim().min(1).optional(),
    descripProd: z.string().trim().max(255).optional(),
    precio: z.coerce.number().nonnegative().optional(),
    activo: z.union([z.boolean(), z.stringbool()]).optional(),
    usaLicencia: z.union([z.boolean(), z.stringbool()]).optional(),
    nombreAtributo: z.string().trim().min(1).max(60).optional(),
    valor: z.string().trim().min(1).max(60).optional()
}).refine(atributoCompleto, { path: ['valor'] });

const bodyListaProductos = z.object({
    listaProductos: z.array(z.object({
        idProducto: z.number().int().positive()
    })).min(1)
});

export const crearProductoFisico = z.object({
    body: bodyCrearFisico
});

export const crearProductoDigital = z.object({
    body: bodyCrearDigital
});

export const modificarProductoFisico = z.object({
    params: z.object({
        idProducto: z.coerce.number().int().positive()
    }),
    body: bodyModificarFisico
});

export const modificarProductoDigital = z.object({
    params: z.object({
        idProducto: z.coerce.number().int().positive()
    }),
    body: bodyModificarDigital
});

export const eliminarProductos = z.object({
    body: bodyListaProductos
});

export const reactivarProductos = z.object({
    body: bodyListaProductos
});

export const obtenerProducto = z.object({
    params: z.object({
        idProducto: z.coerce.number().int().positive()
    })
});

export const obtenerProductosTienda = z.object({
    params: z.object({
        idTienda: z.coerce.number().int().positive()
    })
});

export const descargarProducto = z.object({
    params: z.object({
        idVenta: z.coerce.number().int().positive(),
        idProducto: z.coerce.number().int().positive()
    }),
    user: z.object({
        idPersona: z.number()
    })
});
