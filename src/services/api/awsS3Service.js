import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import fs from 'fs'
import { s3 } from '../../config/aws3.js'

export async function subirArchivo(archivo)
{
    try
    {
        const fileStream = fs.readFileSync(archivo.path);
        switch (archivo.type)
        {
            case 'ARCHIVO':
                await s3.send(new PutObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: archivo.key,
                    Body: fileStream,
                    ContentType: archivo.mimetype,
                    ContentDisposition: "attachment"
                }));
                break;

            case 'IMAGEN PRODUCTO':
                await s3.send(new PutObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: archivo.key,
                    Body: fileStream,
                    ContentType: archivo.mimetype,
                    ContentDisposition: "inline"
                }));

                break;
        }


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

export function generarURLPublica(archivo)
{
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${archivo.key}`
}