import { Ubicaciones } from "../models/ubicaciones.js";
import { validarDireccion } from "../services/api/googleMapsService.js"

export async function obtenerTodosPaises(req, res){
    try
    {
        let paises = await obtenerPaisesDisponibles();
        if(paises){
            return res.status(200).json({
                "Lista de paises": paises
            })
        }
    }
    catch (err)
    {
        return res.status(500).end();
    }
}

export async function validarDireccionController(req, res)
{
    try
    {
        const
        {
            direccion,
            piso,
            depto,
            pais,
            provincia,
            ciudad,
            codigo
        } = req.body;

        const ubicacion = new Ubicaciones({
            direccion,
            piso,
            depto,
            pais,
            provincia,
            ciudad,
            codigo
        });

        const googleRes = await validarDireccion(ubicacion);


        if (!googleRes.esValida) {
            return res.status(400).json({
                estado: "ERROR",
                mensaje: "La dirección ingresada no es válida",
                motivo: googleRes.motivo
            });
        }

        ubicacion.placeid = googleRes.datosUbicacion.placeid;
        ubicacion.codigo = googleRes.datosUbicacion.codigo;

        return res.status(200).json({
            resultado: googleRes
        })
    }
    catch(err){
        return res.status(500).json({
            message: err.message
        })
    }

}