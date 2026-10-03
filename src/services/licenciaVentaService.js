import pool from '../config/conexion.js'

export async function crearLicenciaVentaService(licencia)
{
    const query = `
        INSERT INTO Licencia_Venta (id_producto, clave_digital, clave_usada)
        VALUES ($1, $2, FALSE)
        RETURNING id_lic_vta
    `;

    try
    {
        const resultado = await pool.query(query, [licencia.idProducto, licencia.claveDigital]);
        return resultado.rows[0].id_lic_vta;
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}

export async function validarLicenciaService(licencia, user)
{
    const queryBuscar = `
        SELECT Licencia_Venta.id_lic_vta, Licencia_Venta.id_producto, Licencia_Venta.clave_usada, Ventas.estado
        FROM Licencia_Venta
        JOIN Detalle_Venta ON Detalle_Venta.id_lic_vta = Licencia_Venta.id_lic_vta
        JOIN Ventas ON Ventas.id_venta = Detalle_Venta.id_venta
        JOIN Clientes ON Clientes.id_cliente = Ventas.id_cliente
        JOIN Personas ON Personas.id_persona = Clientes.id_persona
        WHERE Licencia_Venta.clave_digital = $1
        AND Licencia_Venta.id_producto = $2
        AND LOWER(Personas.email) = LOWER($3)
    `;

    const queryLicenciaUsada = `
        UPDATE Licencia_Venta
        SET clave_usada = TRUE
        WHERE clave_digital = $1 AND clave_usada = FALSE
        RETURNING id_lic_vta, id_producto
    `;

    try
    {
        const resBusqueda = await pool.query(queryBuscar, [licencia.claveDigital,
            licencia.idProducto, user.email]);

        if (resBusqueda.rows.length === 0)
        {
            return null;
        }

        if (resBusqueda.rows[0].estado !== 'CERRADA')
        {
            throw new Error("La compra de esta licencia todavía no está pagada");
        }

        const resultado = await pool.query(queryLicenciaUsada, [licencia.claveDigital]);

        if (resultado.rows.length === 0)
        {
            throw new Error("Esta licencia ya fue utilizada");
        }

        return resultado.rows[0];
    }
    catch (err)
    {
        throw new Error(err.message);
    }
}