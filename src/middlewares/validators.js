function mapList(Modelo, valores, atributo)
{
    if (valores === undefined)
    {
        return undefined;
    }

    return valores.map(function (valor)
    {
        if (atributo === undefined)
        {
            return new Modelo(valor);
        }

        const datosModel = {};
        datosModel[atributo] = valor;
        return new Modelo(datosModel);
    });
}

export function validateSchemas(schema, models)
{
    return function (req, res, next)
    {
        const request =
        {
            params: req.params,
            query: req.query,
            body: req.body,
            user: req.user,
            credenciales: req.credenciales,
            google: req.google
        };

        const resultado = schema.safeParse(request);

        if (!resultado.success)
        {
            const detalle = resultado.error.issues.map(function (issue)
            {
                return issue.path.join('.') + ': ' + issue.message;
            });
            return res.status(400).json({ mensaje: "Datos inválidos", detalle: detalle });
        }

        if (models === undefined)
        {
            req.models = resultado.data;
            return next();
        }

        const campos = Object.assign({}, resultado.data.query, resultado.data.body,
            resultado.data.params, resultado.data.user, resultado.data.credenciales, resultado.data.google);
        const datos = [];

        for (let i = 0; i < models.length; i++)
        {
            const elemento = models[i];

            if (Array.isArray(elemento))
            {
                const [Modelo, campoLista, atributo] = elemento;
                datos.push(mapList(Modelo, campos[campoLista], atributo));
            }
            else
            {
                datos.push(new elemento(campos));
            }
        }

        req.models = datos;
        next();
    };
}
