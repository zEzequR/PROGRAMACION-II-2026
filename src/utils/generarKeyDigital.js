import bcrypt from "bcrypt";
import keygen from "keygen"

const venta = { 
    idVta: 30, 
    emailCliente: "ezequiel2013@gmail.com", 
    nombreCliente: "Eze", 
    apellidoCliente: "Ramos" 
};

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

let resultado = await crearKeyHash(venta);

console.log("Hash", resultado[0]);
console.log("Sólo key", resultado[1]);