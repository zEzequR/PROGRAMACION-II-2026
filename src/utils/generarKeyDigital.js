import bcrypt from "bcrypt";
import keygen from "keygen"

export async function crearKeyHash(usuario)
{
    let key = keygen.hex(keygen.large);
    let datos = Object.values(usuario).concat(key).join("-");
    console.log(key);
    console.log(datos);
    return [await bcrypt.hash(datos, 12), key];
}
