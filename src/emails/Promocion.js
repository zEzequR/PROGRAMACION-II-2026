import * as React from 'react';
import { EmailLayout } from './components/EmailLayout.js';

function extraerCuerpo(html) {
    const coincidencia = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);

    if (coincidencia) {
        return coincidencia[1];
    }

    return html;
}

export function Promocion(props) {
    return React.createElement(
        EmailLayout,
        { previewText: props.asunto, ancho: 560 },
        React.createElement('div', { dangerouslySetInnerHTML: { __html: extraerCuerpo(props.contenido) } })
    );
}

Promocion.PreviewProps = {
    asunto: '20% en toda la tienda',
    contenido: '<h1>Promo de la semana</h1><p>Usá el código PROMO20 en tu próxima compra.</p>'
};

export default Promocion;
