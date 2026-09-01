import { z } from 'zod';

export default class Pagos
{
    static propiedades = z.object({
        idTransaccion: z.number().positive("El ID de transacción es requerido"),
        idDetPago: z.number().optional(),
        estado: z.string().min(1, "El estado del pago es requerido"),
        metodoPago: z.string().optional(),
        monto: z.number().positive("El monto debe ser un número mayor a cero").optional()
    });

    constructor(datos)
    {
        const datosValidados = Pagos.propiedades.parse(datos);
        Object.assign(this, datosValidados);
    }
}