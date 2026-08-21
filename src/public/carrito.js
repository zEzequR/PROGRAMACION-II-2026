function obtenerCarrito()
{
    try
    {
        const data = localStorage.getItem('carrito');
        return data ? JSON.parse(data) : [];
    }
    catch(err)
    {
        return [];
    }
}

function guardarCarrito(carrito)
{
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function agregarAlCarrito(idProducto, cantidad = 1)
{
    const carrito = obtenerCarrito();
    const existente = carrito.find(item => item.idProducto === idProducto);

    if (existente)
    {
        existente.cantidad += cantidad;
    }
    else
    {
        carrito.push({ idProducto, cantidad });
    }

    guardarCarrito(carrito);
}

function quitarDelCarrito(idProducto)
{
    const carrito = obtenerCarrito().filter(item => item.idProducto !== idProducto);
    guardarCarrito(carrito);
}

function vaciarCarrito()
{
    localStorage.removeItem('carrito');
}