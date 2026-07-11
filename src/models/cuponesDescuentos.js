export class cuponesDescuentos
{
    constructor(
        codigo,
        tipoDescuento,
        valor,
        fechaExpiracion,
        usosMaximos,
        usosActuales
    )
    {
        this.codigo = codigo;
        this.tipoDescuento = tipoDescuento;
        this.valor = valor;
        this.fechaExpiracion = fechaExpiracion;
        this.usosMaximos = usosMaximos;
        this.usosActuales = usosActuales;
    }
}