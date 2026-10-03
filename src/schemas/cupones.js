import { z } from 'zod';

const fechaExpiracion = z.iso.date().refine(function (fecha)
{
    return fecha >= new Date().toLocaleDateString('sv-SE');
});

const bodyCrearCuponTienda = z.object({
    aplicaTienda: z.literal(true),
    codigo: z.string().trim().min(1).max(255),
    tipoDescuento: z.enum(['MONTOFIJO', 'PORCENTAJE']),
    valor: z.number().positive(),
    fechaExpiracion: fechaExpiracion.optional(),
    usosMaximos: z.number().int().positive().optional()
});

const bodyCrearCuponProductos = z.object({
    aplicaTienda: z.literal(false),
    codigo: z.string().trim().min(1).max(255),
    tipoDescuento: z.enum(['MONTOFIJO', 'PORCENTAJE']),
    valor: z.number().positive(),
    fechaExpiracion: fechaExpiracion.optional(),
    usosMaximos: z.number().int().positive().optional(),
    idProductos: z.array(z.number().int().positive()).min(1).refine(function (lista)
    {
        return new Set(lista).size === lista.length;
    })
});

const bodyModificarCupon = z.object({
    codigo: z.string().trim().min(1).max(255).optional(),
    tipoDescuento: z.enum(['MONTOFIJO', 'PORCENTAJE']).optional(),
    valor: z.number().positive().optional(),
    fechaExpiracion: fechaExpiracion.optional(),
    usosMaximos: z.number().int().positive().optional(),
    aplicaTienda: z.boolean().optional(),
    idProductos: z.array(z.number().int().positive()).min(1).refine(function (lista)
    {
        return new Set(lista).size === lista.length;
    }).optional()
}).refine(function (datos)
{
    if (datos.tipoDescuento === 'PORCENTAJE' && datos.valor !== undefined)
    {
        return datos.valor <= 100;
    }
    return true;
}, { path: ['valor'] })
.refine(function (datos)
{
    if (datos.aplicaTienda === false)
    {
        return datos.idProductos !== undefined;
    }
    return datos.idProductos === undefined;
}, { path: ['idProductos'] })
.refine(function (datos)
{
    if (datos.tipoDescuento !== undefined && datos.valor === undefined)
    {
        return false;
    }
    if (datos.valor !== undefined && datos.tipoDescuento === undefined)
    {
        return false;
    }
    return true;
}, { path: ['valor'], message: "tipoDescuento y valor se mandan juntos" })


export const crearCupon = z.object({
    body: z.discriminatedUnion('aplicaTienda', [bodyCrearCuponTienda, bodyCrearCuponProductos])
        .refine(function (datos)
        {
            if (datos.tipoDescuento === 'PORCENTAJE')
            {
                return datos.valor <= 100;
            }
            return true;
        }, { path: ['valor'] })
});

export const modificarCupon = z.object({
    params: z.object({
        idCuponDesc: z.coerce.number().int().positive()
    }),
    body: bodyModificarCupon
});

export const eliminarCupon = z.object({
    params: z.object({
        idCuponDesc: z.coerce.number().int().positive()
    })
});
