export function formatearResultado(mcpRes)
{
    const bloques = mcpRes.content || [];
    let texto = '';

    for (const bloque of bloques)
    {
        if (bloque.type === 'text')
        {
            texto = texto + bloque.text;
        }
    }

    return texto;
}