import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg;

const pool = new Pool
(
    {
        connectionString: process.env.DATABASE_URL
    }
);

pool.on('error', (err, client) =>
{
    console.error('Error en el pool de PostgreSQL:', err);
});

try
{
    await pool.query('SELECT 1');
    console.log("Conexión exitosa a la base de datos");
}
catch (error)
{
    console.log(`No se pudo conectar a la base de datos. Motivo: ${error.message}`);
}

export default pool