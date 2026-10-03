import { z } from 'zod';

export const obtenerFeed = z.object({
    query: z.object({
        total: z.coerce.number().int().positive().optional(),
        offset: z.coerce.number().int().nonnegative().optional(),
        busqueda: z.string().trim().min(1).max(100).optional(),
        idCat: z.coerce.number().int().positive().optional()
    }),
    user: z.object({
        idPersona: z.number().optional()
    }).nullish()
});
