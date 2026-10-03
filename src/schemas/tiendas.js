import { z } from 'zod';

const bodyCrearTienda = z.object({
    nombreTienda: z.string().trim().min(1).max(100),
    cuit: z.string().trim().min(1).max(20).optional()
});

const bodyModificarTienda = z.object({
    nombreTienda: z.string().trim().min(1).max(100).optional()
});

export const crearTienda = z.object({
    user: z.object({
        idPersona: z.number()
    }),
    body: bodyCrearTienda
});

export const modificarTienda = z.object({
    body: bodyModificarTienda
});

export const reactivarTienda = z.object({
    user: z.object({
        idPersona: z.number()
    })
});

export const obtenerEstadisticas = z.object({
    params: z.object({
        idTienda: z.coerce.number().int().positive().max(2147483647)
    }),
    query: z.object({
        desde: z.coerce.date().optional(),
        hasta: z.coerce.date().optional()
    })
});

export const obtenerPublicKey = z.object({
    params: z.object({
        idTienda: z.coerce.number().int().positive().max(2147483647)
    })
});

// Nuevos: página pública de la tienda y seguir / dejar de seguir
export const obtenerTienda = z.object({
    params: z.object({
        idTienda: z.coerce.number().int().positive().max(2147483647)
    })
});

export const seguirTienda = z.object({
    params: z.object({
        idTienda: z.coerce.number().int().positive().max(2147483647)
    }),
    user: z.object({
        idPersona: z.number()
    })
});
