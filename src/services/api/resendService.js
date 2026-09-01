import { resend } from '../../config/resend.js'

export async function crearContacto(cliente)
{
    const { data, error } = await resend.contacts.create({
        email: cliente.email,
        firstName: cliente.nombre,
        lastName: cliente.apellido,
        unsubscribed: !cliente.suscripcion
    })

    if (error)
    {
        throw new Error(`Error al crear contacto: ${error.message}`)
    }
    return data.id
}

export async function actualizarContacto(cliente)
{
    const { data, error } = await resend.contacts.update({
        id: cliente.resendContactID,
        firstName: cliente.nombre,
        lastName: cliente.apellido,
        unsubscribed: !cliente.suscripcion
    })

    if (error)
    {
        throw new Error(`Error al actualizar contacto: ${error.message}`)
    }
    return data
}

export async function eliminarContacto(cliente)
{
    const { error } = await resend.contacts.remove({
        id: cliente.resendContactID
    })

    if (error)
    {
        throw new Error(`Error al eliminar contacto: ${error.message}`)
    }
    return true
}

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