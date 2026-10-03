import * as React from 'react';
import { Heading, Text, Section } from 'react-email';
import { EmailLayout } from './components/EmailLayout.js';

const estilos = {
    titulo: {
        margin: '0 0 8px',
        fontSize: '22px',
        fontWeight: 700,
        color: '#f5f7ff',
        lineHeight: '1.3'
    },
    descripcion: {
        margin: '0 0 28px',
        fontSize: '14px',
        color: '#9aa3b8',
        lineHeight: '1.5'
    },
    cajaCodigo: {
        textAlign: 'center',
        marginBottom: '24px'
    },
    casillaDigito: {
        display: 'inline-block',
        width: '40px',
        height: '50px',
        lineHeight: '50px',
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 700,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        color: '#ffffff',
        backgroundColor: 'rgba(139,91,255,0.08)',
        border: '1.5px solid #8b5bff',
        borderRadius: '10px',
        margin: '0 4px'
    },
    aviso: {
        margin: '0 0 28px',
        fontSize: '13px',
        color: '#9aa3b8',
        lineHeight: '1.5'
    }
};

function armarCasillasDigitos(codigo) {
    const digitos = codigo.split('');
    const casillas = [];

    for (let indice = 0; indice < digitos.length; indice++) {
        casillas.push(
            React.createElement(
                'span',
                { key: String(indice), style: estilos.casillaDigito },
                digitos[indice]
            )
        );
    }

    return casillas;
}

export function CodigoRecuperacion(props) {
    return React.createElement(
        EmailLayout,
        { previewText: 'Tu código para recuperar la contraseña' },
        React.createElement(Heading, { style: estilos.titulo }, 'Recuperá tu contraseña'),
        React.createElement(Text, { style: estilos.descripcion }, 'Usá el siguiente código para continuar con el proceso.'),
        React.createElement(
            Section,
            { style: estilos.cajaCodigo },
            armarCasillasDigitos(props.codigo)
        ),
        React.createElement(Text, { style: estilos.aviso }, 'Este código expira en 1 minuto. Si vos no solicitaste este cambio, podés ignorar este correo.')
    );
}

CodigoRecuperacion.PreviewProps = {
    codigo: '482913'
};

export default CodigoRecuperacion;
