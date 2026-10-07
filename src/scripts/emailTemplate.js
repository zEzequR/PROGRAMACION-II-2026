import * as React from 'react';
import { render } from 'react-email';
import { obtenerURLService } from '../services/productosService.js';
import { DetalleVenta } from '../models/ventas.js';
import { ConfirmacionVenta } from '../emails/ConfirmacionVenta.js';

export async function generarPlantillaVenta(venta) {
    const items = await Promise.all(venta.items.map(async function (item) {
        let urlDescarga = null;
        let claveDigital = null;

        if (item.producto.tipoProd === 'DIGITAL') {
            const detalle = new DetalleVenta({ idVenta: venta.idVenta, idProducto: item.idProducto });
            const url = await obtenerURLService(detalle, venta.cliente);
            if (url) {
                urlDescarga = url;
            }
        }

        if (item.licencia) {
            claveDigital = item.licencia.claveDigital;
        }

        return {
            nombreProducto: item.producto.nombreProd,
            imagen: item.producto.imagenProd,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario.toFixed(2),
            claveDigital: claveDigital,
            urlDescarga: urlDescarga
        };
    }));

    const elemento = React.createElement(ConfirmacionVenta, {
        nombre: venta.cliente.nombre,
        apellido: venta.cliente.apellido,
        items: items
    });

    return await render(elemento);
}