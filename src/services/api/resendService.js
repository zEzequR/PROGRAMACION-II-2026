import { resend } from '../../config/resend.js'

export async function enviarCorreoIndividual(correo)
{
    const { data, error } = await resend.emails.send({
        from: process.env.RESEND_DEFAULT_FROM,
        to: correo.to,
        subject: correo.subject,
        html: correo.html,
        text: correo.text
    })

    if (error)
    {
        throw new Error(`Error al enviar email: ${error.message}`)
    }
    return data
}

export async function enviarCorreosMarketing(correo, contactsList)
{
    const emails = contactsList.map(contacto => ({
        from: process.env.RESEND_DEFAULT_FROM,
        to: contacto.email,
        subject: correo.subject,
        html: correo.html
    }))

    const { data, error } = await resend.batch.send(emails)

    if (error)
    {
        throw new Error(`Error al enviar emails de marketing: ${error.message}`)
    }
    return data
}