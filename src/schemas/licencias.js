import { z } from 'zod';

export const validarLicencia = z.object({
    body: z.object({
        claveDigital: z.string().trim().min(1),
        email: z.email().max(255),
        idProducto: z.number().int().positive()
    })
});