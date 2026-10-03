import { obtenerCategoriasService } from '../services/categoriasService.js';

export async function obtenerCategorias(req, res)
{
    try
    {
        const categorias = await obtenerCategoriasService();
        return res.status(200).json({ categorias });
    }
    catch (err)
    {
        return res.status(500).json({ mensaje: err.message });
    }
}