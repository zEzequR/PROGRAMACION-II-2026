export async function crearEmprendedor(req, res)
{
    try
    {
        const
        {
            email,
            psw,
            nombre,
            apellido,
            telefono,
            cuit
        } = req.body

        if (!email || !psw || !nombre || !apellido || !cuit)
        {
            return res.status(400).json(
            {
                estado : "ERROR",
                mensaje : "Faltan campos obligatorios"
            })
        }

        return res.status(201).json(
        {
            estado : "OK",
            mensaje : "Emprendedor creado con éxito",
            emprendedor :
            {
                email,
                nombre,
                apellido,
                telefono : telefono,
                cuit,
                fechaCreacion : Date.now()
            }
        });
    }
    catch(err)
    {
        return res.status(500).json(
        {
            estado : "ERROR",
            mensaje : err.message
        });
    };
}