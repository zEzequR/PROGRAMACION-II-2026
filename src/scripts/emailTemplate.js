import * as React from 'react';
import { render } from 'react-email';
import { generarUrlDescarga } from '../services/api/awsS3Service.js';
import { ArchivoDigital } from '../models/archivoDigital.js';
import { ConfirmacionVenta } from '../emails/ConfirmacionVenta.js';

export async function generarPlantillaVenta(venta, detallesVenta) {
    const items = await Promise.all(detallesVenta.map(async function (item) {
        let urlDescarga = null;

        if (item.archivo_prod) {
            urlDescarga = await generarUrlDescarga(new ArchivoDigital({ key: item.archivo_prod }));
        }

        return {
            nombreProducto: item.nombre_prod,
            imagen: item.imagen_prod,
            cantidad: item.cantidad,
            precioUnitario: item.precio_unitario,
            claveDigital: item.clave_digital || null,
            urlDescarga: urlDescarga
        };
    }));

    const elemento = React.createElement(ConfirmacionVenta, {
        nombre: detallesVenta[0].nombre,
        apellido: detallesVenta[0].apellido,
        items: items
    });

    return await render(elemento);
}
