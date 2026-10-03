import { z } from 'zod';

export const registrarVista = z.object({
    user: z.object({
        idPersona: z.number()
    }),
    body: z.object({
        idProducto: z.coerce.number().int().positive(),
        tipoEvento: z.literal('Vista').default('Vista')
    })
});

export const registrarClick = z.object({
    user: z.object({
        idPersona: z.number()
    }),
    body: z.object({
        idProducto: z.coerce.number().int().positive(),
        tipoEvento: z.literal('Click').default('Click')
    })
});
