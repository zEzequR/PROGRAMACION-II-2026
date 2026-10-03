import * as React from 'react';
import { Html, Head, Body, Container, Row, Column, Text, Hr, Preview } from 'react-email';

const estilos = {
    body: {
        backgroundColor: '#05060a',
        padding: '40px 20px',
        fontFamily: "'Segoe UI', Roboto, Arial, sans-serif"
    },
    tarjeta: {
        margin: '0 auto',
        backgroundColor: '#0d0f1a',
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: '22px',
        padding: '38px 34px'
    },
    filaLogo: {
        marginBottom: '24px'
    },
    columnaLogoIcono: {
        width: '26px'
    },
    logoCuadrado: {
        width: '26px',
        height: '26px',
        borderRadius: '8px',
        backgroundColor: '#8b5bff'
    },
    logoTexto: {
        paddingLeft: '10px',
        fontSize: '20px',
        fontWeight: 700,
        color: '#f5f7ff',
        margin: 0
    },
    separador: {
        borderColor: 'rgba(255,255,255,0.14)',
        margin: '0 0 20px'
    },
    footer: {
        margin: 0,
        fontSize: '12px',
        color: '#6b7280'
    }
};

// Layout compartido por todos los correos transaccionales de Localia (branding + estructura de card).
// props.ancho: ancho máximo de la card en px (default 480).
export function EmailLayout(props) {
    const estiloTarjeta = Object.assign({}, estilos.tarjeta, { maxWidth: (props.ancho || 480) + 'px' });

    return React.createElement(
        Html,
        null,
        React.createElement(Head, null),
        React.createElement(Preview, null, props.previewText),
        React.createElement(
            Body,
            { style: estilos.body },
            React.createElement(
                Container,
                { style: estiloTarjeta },
                React.createElement(
                    Row,
                    { style: estilos.filaLogo },
                    React.createElement(
                        Column,
                        { style: estilos.columnaLogoIcono },
                        React.createElement('div', { style: estilos.logoCuadrado })
                    ),
                    React.createElement(
                        Column,
                        null,
                        React.createElement(Text, { style: estilos.logoTexto }, 'Localia')
                    )
                ),
                props.children,
                React.createElement(Hr, { style: estilos.separador }),
                React.createElement(Text, { style: estilos.footer }, '© 2026 Localia · Este es un correo automático, no lo respondas.')
            )
        )
    );
}
