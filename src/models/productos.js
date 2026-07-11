class Productos
{
    constructor(
        tipoProd,
        nombreProd,
        imagenProd,
        descripProd,
        precio,
        activo,
    )
    {
        this.tipoProd = tipoProd;
        this.nombreProd = nombreProd;
        this.imagenProd = imagenProd;
        this.descripProd = descripProd;
        this.precio = precio;
        this.activo = activo;
    }
}

class ProductosDigitales extends Productos
{
    constructor(tipoProd, nombreProd, imagenProd,
    descripProd, precio, activo,
    archivoProd)
    {

        super(tipoProd, nombreProd,
        imagenProd, descripProd,
        precio, activo);

        this.archivoProd = archivoProd;
    }
}

class ProductosFisicos extends Productos
{
    constructor(tipoProd, nombreProd, imagenProd,
    descripProd, precio, activo,
    stock)
    {
        super(tipoProd, nombreProd, imagenProd,
        descripProd, precio, activo);
        
        this.stock = stock;
    }
}

export { Productos, ProductosDigitales, ProductosFisicos }