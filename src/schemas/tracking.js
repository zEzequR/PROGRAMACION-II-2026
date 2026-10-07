import { z } from 'zod';

export const registrarDetalle = z.object({
    user: z.object({
        idPersona: z.number()
    }),
    body: z.object({
        idProducto: z.coerce.number().int().positive(),
        tipoEvento: z.literal('Detalle').default('Detalle')
    })
});

export const registrarVisitaTienda = z.object({
    user: z.object({
        idPersona: z.number()
    }),
    body: z.object({
        idProducto: z.coerce.number().int().positive(),
        tipoEvento: z.literal('VisitaTienda').default('VisitaTienda')
    })
});

export const registrarCarrito = z.object({
    user: z.object({
        idPersona: z.number()
    }),
    body: z.object({
        idProducto: z.coerce.number().int().positive(),
        tipoEvento: z.literal('Carrito').default('Carrito')
    })
});
