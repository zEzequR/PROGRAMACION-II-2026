import * as React from 'react';
import { Row, Column, Text, Section, Img, Link } from 'react-email';
import { Key, Download } from 'lucide-react';

const estilos = {
    item: {
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '16px',
        marginBottom: '16px'
    },
    columnaImagen: {
        width: '70px',
        verticalAlign: 'top',
        paddingRight: '14px'
    },
    columnaTexto: {
        verticalAlign: 'top'
    },
    imagen: {
        width: '70px',
        height: '70px',
        objectFit: 'cover',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.14)',
        display: 'block'
    },
    nombreProducto: {
        margin: '0 0 4px',
        fontSize: '15px',
        fontWeight: 700,
        color: '#f5f7ff',
        lineHeight: '1.3'
    },
    detalleProducto: {
        margin: 0,
        fontSize: '13px',
        color: '#9aa3b8'
    },
    precio: {
        color: '#f5f7ff',
        fontWeight: 700
    },
    cajaLicencia: {
        backgroundColor: 'rgba(139,91,255,0.1)',
        border: '1px solid rgba(139,91,255,0.3)',
        borderRadius: '10px',
        marginTop: '10px',
        padding: '10px 12px'
    },
    textoLicencia: {
        margin: 0,
        fontSize: '13px',
        color: '#f5f7ff'
    },
    etiquetaLicencia: {
        color: '#f5f7ff'
    },
    codigoLicencia: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: '2px 6px',
        borderRadius: '4px',
        color: '#ffffff',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
    },
    enlaceDescarga: {
        display: 'inline-block',
        marginTop: '8px',
        fontSize: '13px',
        fontWeight: 700,
        color: '#8b5bff',
        textDecoration: 'none'
    },
    icono: {
        verticalAlign: 'text-bottom',
        marginRight: '4px'
    }
};

// Un ítem (producto) dentro del detalle de la venta: imagen, cantidad/precio,
// y opcionalmente la licencia digital y/o el link de descarga del archivo.
export function ItemVenta(props) {
    const item = props.item;
    const columnaTexto = [];

    columnaTexto.push(
        React.createElement(Text, { key: 'nombre', style: estilos.nombreProducto }, item.nombreProducto)
    );

    columnaTexto.push(
        React.createElement(
            Text,
            { key: 'detalle', style: estilos.detalleProducto },
            'Cantidad: ' + item.cantidad + ' — ',
            React.createElement('span', { style: estilos.precio }, '$' + item.precioUnitario)
        )
    );

    if (item.claveDigital) {
        columnaTexto.push(
            React.createElement(
                Section,
                { key: 'licencia', style: estilos.cajaLicencia },
                React.createElement(
                    Text,
                    { style: estilos.textoLicencia },
                    React.createElement(Key, { size: 14, color: '#f5f7ff', strokeWidth: 2, style: estilos.icono }),
                    React.createElement('strong', { style: estilos.etiquetaLicencia }, 'Licencia digital: '),
                    React.createElement('code', { style: estilos.codigoLicencia }, item.claveDigital)
                )
            )
        );
    }

    if (item.urlDescarga) {
        columnaTexto.push(
            React.createElement(
                Link,
                { key: 'descarga', href: item.urlDescarga, style: estilos.enlaceDescarga },
                React.createElement(Download, { size: 14, color: '#8b5bff', strokeWidth: 2, style: estilos.icono }),
                'Descargar archivo adjunto'
            )
        );
    }

    return React.createElement(
        Section,
        { style: estilos.item },
        React.createElement(
            Row,
            null,
            React.createElement(
                Column,
                { style: estilos.columnaImagen },
                React.createElement(Img, { src: item.imagen, alt: item.nombreProducto, width: '70', height: '70', style: estilos.imagen })
            ),
            React.createElement(Column, { style: estilos.columnaTexto }, columnaTexto)
        )
    );
}
