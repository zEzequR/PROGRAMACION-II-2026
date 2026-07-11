class categoriasProductos
{
    constructor(
        categoria
    )
    {
        this.categoria = categoria;
    }
}

class atributosCategoria extends categoriasProductos {
    constructor(categoria, nombreAtributo)
    {
        super(categoria);
        this.nombreAtributo = nombreAtributo;
    }
}

class especificacionesProducto extends atributosCategoria {
    constructor(categoria, nombreAtributo, valor)
    {
        super(categoria, nombreAtributo);
        this.valor = valor;
    }
}

export { categoriasProductos, atributosCategoria, especificacionesProducto }