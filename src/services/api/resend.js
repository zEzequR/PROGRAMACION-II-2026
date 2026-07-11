import 'dotenv/config'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY);

export async function crearContacto(cliente)
{
    try
    {
        const {
            data, error
        } = await resend.contacts.create(
            {
                email: cliente.email,
                firstName: cliente.nombre,
                lastName: cliente.apellido,
                unsubscribed: cliente.suscripto,
            });
        
        if (error)
            {
                throw new Error(error.message)
            }

        return data
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function eliminarContacto(cliente)
{
    try
    {
        const
        {
            data,
            error
        } = await resend.contacts.remove(
            {
                id: cliente.resendContactID,
            });
        
        if (error)
            {
                throw new Error(error.message)
            }
        
        return data
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function actualizarContacto(cliente)
{
    try
    {
        const
        {
            data,
            error
        } = await resend.contacts.update(
            {
                id: cliente.resendContactID,
                firstName: cliente.nombre,
                unsubscribed: cliente.suscripto,
            });
        
        if (error)
            {
                throw new Error(error.message)
            }

            return data;
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}

export async function enviarCorreoIndividual(correo)
{
    try
    {
        const 
        {
            data, error
        } = await resend.emails.send(
            {
                from: correo.from,
                to: correo.to,
                subject: correo.subject,
                html: correo.html,
            });

        if (error)
            {
                throw new Error(error.message)
            }

        return data
    }
        catch(err)
    {
        throw new Error(err.message)
    }
}

export async function enviarCorreosMarketing(correo, contactsList)
{
    try
    {
        const emails = contactsList.map(contacto => (
        {
            from: correo.from,
            to: contacto.email,
            subject: correo.subject,
            html: correo.html
        }))

        const
        {
            data,
            error
        } = await resend.batch.send(emails)

        if (error)
            {
                throw new Error(error.message)
            }

        return data
    }
    catch(err)
    {
        throw new Error(err.message)
    }
}