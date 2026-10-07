import { validarDireccion, obtenerPaisesDisponibles } from "../services/api/googleMapsService.js"

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
        const [ubicacion] = req.models;

        const googleRes = await validarDireccion(ubicacion);

        if (!googleRes.esValida) {
            return res.status(400).json({
                mensaje: "La dirección ingresada no es válida",
                motivo: googleRes.motivo
            });
        }

        return res.status(200).json({
            resultado: googleRes
        })
    }
    catch(err){
        return res.status(500).json({
            mensaje: err.message
        })
    }

}