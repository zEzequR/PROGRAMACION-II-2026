import * as React from 'react';
import { Heading, Text } from 'react-email';
import { EmailLayout } from './components/EmailLayout.js';
import { ItemVenta } from './components/ItemVenta.js';

const estilos = {
    titulo: {
        margin: '0 0 8px',
        fontSize: '22px',
        fontWeight: 700,
        color: '#f5f7ff',
        lineHeight: '1.3'
    },
    descripcion: {
        margin: '0 0 24px',
        fontSize: '14px',
        color: '#9aa3b8',
        lineHeight: '1.5'
    }
};

export function ConfirmacionVenta(props) {
    const items = props.items.map(function (item, indice) {
        return React.createElement(ItemVenta, { key: String(indice), item: item });
    });

    return React.createElement(
        EmailLayout,
        { previewText: 'Confirmación de tu compra en Localia', ancho: 520 },
        React.createElement(Heading, { style: estilos.titulo }, '¡Gracias por tu compra, ' + props.nombre + ' ' + props.apellido + '!'),
        React.createElement(Text, { style: estilos.descripcion }, 'Tu pago ha sido confirmado. A continuación tenés el resumen de tu pedido y los accesos a tus productos:'),
        items
    );
}

ConfirmacionVenta.PreviewProps = {
    nombre: 'Juana',
    apellido: 'Pérez',
    items: [
        {
            nombreProducto: 'Remera oversize Localia',
            cantidad: 2,
            precioUnitario: '4500',
            imagen: 'https://dummyimage.com/140x140/0d0f1a/8b5bff.png',
            claveDigital: null,
            urlDescarga: null
        },
        {
            nombreProducto: 'Curso de diseño (digital)',
            cantidad: 1,
            precioUnitario: '9999',
            imagen: 'https://dummyimage.com/140x140/0d0f1a/8b5bff.png',
            claveDigital: 'ABCD-1234-EFGH',
            urlDescarga: 'https://example.com/descarga'
        }
    ]
};

export default ConfirmacionVenta;
