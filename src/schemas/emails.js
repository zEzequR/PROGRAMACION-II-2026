import { z } from 'zod';

export const enviarPromocion = z.object({
    body: z.object({
        subject: z.string().trim().min(1),
        html: z.string().trim().min(1)
    })
});

export const solicitarCodigo = z.object({
    body: z.object({
        email: z.email().max(255)
    })
});
