import { z } from 'zod';

const bodyPagoTarjeta = z.object({
    metodo: z.literal('TARJETA'),
    idVenta: z.number().int().positive().max(2147483647),
    descripcion: z.string().trim().min(1).optional(),
    token: z.string().min(1),
    payment_method_id: z.string().min(1),
    payment_type_id: z.string().min(1),
    installments: z.number().int().positive(),
    payer: z.object({
        email: z.email()
    })
});

const bodyPagoQr = z.object({
    metodo: z.literal('QR'),
    idVenta: z.number().int().positive().max(2147483647),
    descripcion: z.string().trim().min(1).optional()
});

export const procesarPago = z.object({
    user: z.object({
        idPersona: z.number()
    }),
    body: z.discriminatedUnion('metodo', [bodyPagoTarjeta, bodyPagoQr])
});
