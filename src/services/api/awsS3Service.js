import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import fs from 'fs'
import { s3 } from '../../config/aws3.js'

export async function subirArchivo(archivo)
{
    try
    {
        const fileStream = fs.createReadStream(archivo.path)

        await s3.send(new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: archivo.key,
            Body: fileStream,
            ContentType: archivo.mimetype
        }))

        return true
    }
    catch (err)
    {
        throw new Error(`Error al subir archivo: ${err.message}`)
    }
}

export async function generarUrlDescarga(archivo)
{
    const url = await getSignedUrl(s3, new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: archivo.key
    }), { expiresIn: 3600 })

    return url
}

export async function reemplazarArchivo(archivo)
{
    try
    {
        const fileStream = fs.createReadStream(archivo.path)

        await s3.send(new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: archivo.key,
            Body: fileStream,
            ContentType: archivo.mimetype
        }))

        return true
    }
    catch (err)
    {
        throw new Error(`Error al reemplazar archivo: ${err.message}`)
    }
}