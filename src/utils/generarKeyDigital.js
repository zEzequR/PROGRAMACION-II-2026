import bcrypt from "bcrypt";
import keygen from "keygen"

export async function crearKeyHash(venta)
{
    let key = keygen.hex(keygen.large);
    let datos = Object.values(venta).concat(key).join("-");
    console.log(key);
    console.log(datos);
    return [await bcrypt.hash(datos, 12), key];
}

export async function validarKey(key, dbKey)
{
    return bcrypt.compare(key, dbKey);
}