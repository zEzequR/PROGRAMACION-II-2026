import { z } from 'zod';

export const crearVenta = z.object({
    user: z.object({
        idPersona: z.number()
    }),
    body: z.object({
        idTienda: z.number().int().positive(),
        suscripcion: z.boolean().default(false),
        codigo: z.string().trim().min(1).max(255).optional(),
        items: z.array(z.object({
            idProducto: z.number().int().positive(),
            cantidad: z.number().int().positive()
        })).min(1).refine(function (lista)
        {
            const ids = lista.map(function (item)
            {
                return item.idProducto;
            });
            return new Set(ids).size === ids.length;
        })
    })
});

export const obtenerVenta = z.object({
    params: z.object({
        idVenta: z.coerce.number().int().positive()
    }),
    user: z.object({
        idPersona: z.number()
    })
});

export const obtenerEstadoVenta = z.object({
    params: z.object({
        idVenta: z.coerce.number().int().positive()
    }),
    user: z.object({
        idPersona: z.number()
    })
});

export const obtenerMisCompras = z.object({
    user: z.object({
        idPersona: z.number()
    })
});

export const obtenerVentasCliente = z.object({
    params: z.object({
        idCliente: z.coerce.number().int().positive()
    }),
    user: z.object({
        idPersona: z.number()
    })
});
