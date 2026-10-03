import { z } from 'zod';

export const validarDireccion = z.object({
    body: z.object({
        direccion: z.string().trim().min(1).max(255),
        piso: z.string().trim().max(10).optional(),
        depto: z.string().trim().max(10).optional(),
        pais: z.string().trim().min(1).max(60),
        provincia: z.string().trim().min(1).max(60),
        ciudad: z.string().trim().min(1).max(60),
        codigo: z.string().trim().max(60).optional()
    })
});
