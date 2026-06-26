class Pagos
{
    constructor(
        idTransaccion,
        estado,
        metodoPago,
        monto,
        fechaPago
    )
    {
        this.idTransaccion = idTransaccion;
        this.estado = estado;
        this.metodoPago = metodoPago;
        this.monto = monto;
        this.fechaPago = fechaPago;
    }
}
