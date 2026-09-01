import pool from '../config/conexion.js';
import { enviarCorreosMarketing } from './api/resendService.js';

export async function enviarPromocionTiendaService(correo)
{
    const query = `
        SELECT Personas.email, Personas.nombre, Personas.apellido
        FROM Clientes
        JOIN Personas ON Clientes.id_persona = Personas.id_persona
        WHERE Clientes.id_tienda = $1 AND Clientes.suscripcion = TRUE AND Personas.activo = TRUE;
    `;
    
    const { rows: clientesSuscriptos } = await pool.query(query, [correo.idTienda]);

    if (clientesSuscriptos.length === 0) {
        throw new Error("La tienda no posee clientes suscriptos para recibir promociones.");
    }

    return await enviarCorreosMarketing(correo, clientesSuscriptos);
}