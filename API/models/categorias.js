class categoriasProductos
{
    constructor(
        categoria
    )
    {
        this.categoria = categoria;
    }
}

class atributosCategoria extends categoriasProductos
{
    constructor(
        nombreAtributo
    )
    {
        super(categoria);
        this.nombreAtributo = nombreAtributo;
    }
}

class especificacionesProducto extends atributosCategoria
{
    constructor(
        valor
    )
    {
        super(categoria, nombreAtributo);
        this.valor = valor;
    }
}