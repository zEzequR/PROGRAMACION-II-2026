import crypto from 'crypto'
import { Emprendedor } from '../../models/usuario.js'
import { modificarEmprendedorService } from '../emprendedorService.js'
import
{
    MP_API_BASE, MP_AUTH_BASE,
    MP_CLIENT_ID, MP_CLIENT_SECRET, MP_OAUTH_REDIRECT_URI,
    MP_QR_CLIENT_ID, MP_QR_CLIENT_SECRET, MP_QR_OAUTH_REDIRECT_URI,
    MP_MARKETPLACE_FEE_PERCENT,
    MP_WEBHOOK_URL, MP_BACK_SUCCESS, MP_BACK_FAILURE, MP_BACK_PENDING
} from '../../config/mercadopago.js'

// Si al token le queda menos de este tiempo, lo renovamos antes de usarlo (ver obtenerAccessTokenVigente).
const MARGEN_RENOVACION_MS = 24 * 60 * 60 * 1000; // 24hs

// ============================================================
// OAUTH — TARJETA (app "pp2api")
// Esto es lo que usa un EMPRENDEDOR para conectar su propia cuenta
// de Mercado Pago y poder cobrar las ventas de su tienda.
// ============================================================

// Arma la URL a la que hay que mandar al emprendedor para que autorice la conexión.
// Recibe: state (un JWT nuestro con el idPersona adentro, para saber quién es cuando vuelva).
// Devuelve: un string con la URL completa de auth.mercadopago.com (no hace ningún fetch, solo arma texto).
export function obtenerUrlConexion(state)
{
    const params = new URLSearchParams(
    {
        client_id: MP_CLIENT_ID,
        response_type: "code",
        platform_id: "mp",
        redirect_uri: MP_OAUTH_REDIRECT_URI,
        state
    });

    return `${MP_AUTH_BASE}/authorization?${params.toString()}`;
}

// Mercado Pago redirige de vuelta con un "code" de un solo uso. Esta función lo
// cambia por el access_token/refresh_token reales del emprendedor.
// Recibe: code (string que vino en la URL de vuelta).
// Devuelve: el JSON de Mercado Pago con access_token, refresh_token, user_id, public_key, expires_in.
export async function intercambiarCodigoService(code)
{
    const res = await fetch(`${MP_API_BASE}/oauth/token`,
    {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
        {
            client_id: MP_CLIENT_ID,
            client_secret: MP_CLIENT_SECRET,
            code,
            grant_type: "authorization_code",
            redirect_uri: MP_OAUTH_REDIRECT_URI
        })
    });

    const data = await res.json();

    if (!res.ok)
    {
        throw new Error(JSON.stringify(data));
    }

    return data;
}

// Se llama cada vez que vamos a cobrarle a un emprendedor (crear una orden o
// consultar una en el webhook). Si su token todavía tiene vida, lo devuelve tal
// cual; si está por vencer (o ya venció), pide uno nuevo con el refresh_token y
// guarda el nuevo token en la base antes de devolverlo.
// Recibe: emprendedor (fila de la tabla Emprendedores, con mp_access_token/mp_refresh_token/etc).
// Devuelve: un string, el access_token listo para usar.
export async function obtenerAccessTokenVigente(emprendedor)
{
    const expira = emprendedor.mpTokenExpiresAt ? new Date(emprendedor.mpTokenExpiresAt).getTime() : 0;
    const faltaPocoOYaVencio = (expira - Date.now()) < MARGEN_RENOVACION_MS;

    if (!faltaPocoOYaVencio || !emprendedor.mpRefreshToken)
    {
        return emprendedor.mpAccessToken;
    }

    try
    {
        const res = await fetch(`${MP_API_BASE}/oauth/token`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
            {
                client_id: MP_CLIENT_ID,
                client_secret: MP_CLIENT_SECRET,
                grant_type: "refresh_token",
                refresh_token: emprendedor.mpRefreshToken
            })
        });

        const resultado = await res.json();

        if (!res.ok)
        {
            throw new Error(JSON.stringify(resultado));
        }

        const emprendedorRenovado = new Emprendedor(
        {
            idPersona: emprendedor.idPersona,
            mpAccessToken: resultado.access_token,
            mpRefreshToken: resultado.refresh_token,
            mpUserId: String(resultado.user_id),
            mpPublicKey: resultado.public_key,
            mpTokenExpiresAt: new Date(Date.now() + (resultado.expires_in || 15552000) * 1000)
        });

        await modificarEmprendedorService(emprendedorRenovado);

        return resultado.access_token;
    }
    catch(err)
    {
        throw new Error(`No se pudo renovar el token de Mercado Pago: ${err.message}`);
    }
}

// ============================================================
// OAUTH — QR (app "Localia QR")
// Mismo mecanismo que arriba, pero para la app de QR, que es
// distinta a la de tarjeta (otro client_id/secret, otro token).
// ============================================================

// Igual que obtenerUrlConexion pero apuntando a la app de QR.
export function obtenerUrlConexionQr(state)
{
    const params = new URLSearchParams(
    {
        client_id: MP_QR_CLIENT_ID,
        response_type: "code",
        platform_id: "mp",
        redirect_uri: MP_QR_OAUTH_REDIRECT_URI,
        state
    });

    return `${MP_AUTH_BASE}/authorization?${params.toString()}`;
}

// Igual que intercambiarCodigoService pero con las credenciales de la app de QR.
export async function intercambiarCodigoQrService(code)
{
    const res = await fetch(`${MP_API_BASE}/oauth/token`,
    {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
        {
            client_id: MP_QR_CLIENT_ID,
            client_secret: MP_QR_CLIENT_SECRET,
            code,
            grant_type: "authorization_code",
            redirect_uri: MP_QR_OAUTH_REDIRECT_URI
        })
    });

    const data = await res.json();

    if (!res.ok)
    {
        throw new Error(JSON.stringify(data));
    }

    return data;
}

// Igual que obtenerAccessTokenVigente pero con los campos mp_qr_* del emprendedor.
export async function obtenerAccessTokenQrVigente(emprendedor)
{
    const expira = emprendedor.mpQrTokenExpiresAt ? new Date(emprendedor.mpQrTokenExpiresAt).getTime() : 0;
    const faltaPocoOYaVencio = (expira - Date.now()) < MARGEN_RENOVACION_MS;

    if (!faltaPocoOYaVencio || !emprendedor.mpQrRefreshToken)
    {
        return emprendedor.mpQrAccessToken;
    }

    try
    {
        const res = await fetch(`${MP_API_BASE}/oauth/token`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
            {
                client_id: MP_QR_CLIENT_ID,
                client_secret: MP_QR_CLIENT_SECRET,
                grant_type: "refresh_token",
                refresh_token: emprendedor.mpQrRefreshToken
            })
        });

        const resultado = await res.json();

        if (!res.ok)
        {
            throw new Error(JSON.stringify(resultado));
        }

        const emprendedorRenovado = new Emprendedor(
        {
            idPersona: emprendedor.idPersona,
            mpQrAccessToken: resultado.access_token,
            mpQrRefreshToken: resultado.refresh_token,
            mpQrUserId: String(resultado.user_id),
            mpQrTokenExpiresAt: new Date(Date.now() + (resultado.expires_in || 15552000) * 1000)
        });

        await modificarEmprendedorService(emprendedorRenovado);

        return resultado.access_token;
    }
    catch(err)
    {
        throw new Error(`No se pudo renovar el token QR de Mercado Pago: ${err.message}`);
    }
}

// ============================================================
// ORDERS — PAGO CON TARJETA
// ============================================================

// Crea la Order de Mercado Pago para cobrar una venta, con tarjeta o con QR.
// Recibe:
//   - datosVenta: { idVenta, descripcion, monto } de nuestra propia venta
//   - emprendedor: fila de Emprendedores, dueño de la tienda que cobra
//   - metodo: 'TARJETA' o 'QR'
//   - datosTarjeta: lo que mandó el Card Payment Brick (token, payment_method_id, payment_type_id,
//     installments, payer.email). Con QR no se usa.
// Devuelve: el objeto Order de Mercado Pago (status, status_detail, id y, con QR, type_response.qr_data).
// Si Mercado Pago rechaza la tarjeta (402), igual devolvemos la Order (con status "failed"):
// un rechazo es un resultado normal, no una falla nuestra.
export async function crearOrdenService(datosVenta, emprendedor, metodo, datosTarjeta)
{
    const porcentajeComision = Number(MP_MARKETPLACE_FEE_PERCENT) || 0;
    const comision = (Number(datosVenta.monto) * porcentajeComision / 100).toFixed(2);
    const monto = Number(datosVenta.monto).toFixed(2); // Mercado Pago quiere los montos como string

    // Lo que es igual para tarjeta y QR
    const body =
    {
        external_reference: String(datosVenta.idVenta), // así el webhook sabe a qué venta nuestra corresponde
        description: datosVenta.descripcion,
        total_amount: monto,
        marketplace_fee: comision, // nuestra comisión como plataforma
        transactions:
        {
            payments: [ { amount: monto } ]
        }
    };

    let accessToken;

    if (metodo === 'QR')
    {
        accessToken = await obtenerAccessTokenQrVigente(emprendedor);

        // Sin payment_method: el comprador elige cómo pagar adentro de la app
        body.type = "qr";
        body.config =
        {
            qr:
            {
                external_pos_id: emprendedor.mpQrPosId, // la caja del emprendedor (de crearSucursalYCajaService)
                mode: "dynamic" // un QR nuevo por cada venta, no uno fijo reutilizable
            }
        };
    }
    else
    {
        accessToken = await obtenerAccessTokenVigente(emprendedor);

        body.type = "online";
        body.processing_mode = "automatic";
        body.payer = { email: datosTarjeta.payer.email };
        body.transactions.payments[0].payment_method =
        {
            id: datosTarjeta.payment_method_id,   // ej: "visa", "master"
            type: datosTarjeta.payment_type_id,   // ej: "credit_card", "debit_card"
            token: datosTarjeta.token,            // token de la tarjeta, nunca el número real
            installments: datosTarjeta.installments
        };
        body.config =
        {
            online:
            {
                callback_url: MP_WEBHOOK_URL, // a dónde nos avisa Mercado Pago cuando cambia el estado
                success_url: MP_BACK_SUCCESS,
                failure_url: MP_BACK_FAILURE,
                pending_url: MP_BACK_PENDING,
                auto_return: "approved"
            }
        };
    }

    const res = await fetch(`${MP_API_BASE}/v1/orders`,
    {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "X-Idempotency-Key": crypto.randomUUID() // evita que un reintento de red duplique el cobro
        },
        body: JSON.stringify(body)
    });

    const data = await res.json();

    if (res.ok)
    {
        return data;
    }

    // 402 = la tarjeta fue rechazada, pero Mercado Pago igual manda la Order completa
    // (con status "failed") adentro de data.data
    if (res.status === 402 && data.data)
    {
        return data.data;
    }

    // Cualquier otro código (400, 401, etc.) sí es un error real
    console.error(`[MP ORDER ERROR ${metodo}] body enviado:`, JSON.stringify(body));
    console.error(`[MP ORDER ERROR ${metodo}] respuesta:`, JSON.stringify(data));

    if (res.status === 400 && metodo === 'TARJETA')
    {
        throw new Error("Los datos del pago no son válidos");
    }

    let detalle = data.message || JSON.stringify(data);
    if (Array.isArray(data.errors))
    {
        detalle = JSON.stringify(data.errors);
    }
    throw new Error(`(${res.status}) ${detalle}`);
}


// ============================================================
// QR — SUCURSAL, CAJA Y ORDERS
// ============================================================

// Se llama UNA SOLA VEZ por emprendedor, justo después de que conecta la app de
// QR (ver callbackMercadoPagoQr). Da de alta su "sucursal" y su "caja" en
// Mercado Pago — son requisito para poder generar cobros por QR.
// Recibe: accessToken del emprendedor (ya conectado), mpUserId (su cuenta MP), direccion (geocodificada con Google Maps).
// Devuelve: { storeId, posExternalId } — hay que guardar los dos en la base
// (mp_qr_store_id / mp_qr_pos_id) para poder crear orders QR más adelante.
export async function crearSucursalYCajaService(accessToken, mpUserId, direccion)
{
    const bodySucursal =
    {
        name: "Sucursal " + direccion.ciudad,
        external_id: "SUC" + crypto.randomBytes(10).toString('hex'), // identificador único nuestro, alfanumérico
        location:
        {
            street_number: String(direccion.numero),
            street_name: direccion.calle,
            city_name: direccion.ciudad,
            state_name: direccion.provincia,
            latitude: direccion.latitud,
            longitude: direccion.longitud
        }
    };

    const resSucursal = await fetch(`${MP_API_BASE}/users/${mpUserId}/stores`,
    {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(bodySucursal)
    });

    const dataSucursal = await resSucursal.json();

    if (!resSucursal.ok)
    {
        throw new Error(`No se pudo crear la sucursal: ${JSON.stringify(dataSucursal)}`);
    }

    // Con el id que nos devolvió la sucursal, creamos la caja asociada.
    const bodyCaja =
    {
        name: "Caja principal",
        store_id: String(dataSucursal.id),
        external_id: "CAJA" + crypto.randomBytes(10).toString('hex'),
        config:
        {
            qr:
            {
                operating_mode: "pdv" // modo "atendido": nosotros creamos cada order, no un QR fijo
            }
        }
    };

    const resCaja = await fetch(`${MP_API_BASE}/v2/pos`,
    {
        method: "POST",
        headers:
        {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "X-Idempotency-Key": crypto.randomUUID()
        },
        body: JSON.stringify(bodyCaja)
    });

    const dataCaja = await resCaja.json();

    if (!resCaja.ok)
    {
        throw new Error(`No se pudo crear la caja: ${JSON.stringify(dataCaja)}`);
    }

    return {
        storeId: String(dataSucursal.id),
        posExternalId: dataCaja.external_id
    };
}

// ============================================================
// WEBHOOK — firma y consulta de orden
// Estas dos funciones las usa el controller cuando llega una
// notificación de Mercado Pago avisando que algo cambió.
// ============================================================

// Mercado Pago firma cada notificación con un HMAC (header x-signature) para que
// podamos confirmar que el aviso vino realmente de ellos y no de cualquiera.
// Esta función rehace ese cálculo nosotros mismos y lo compara.
// Recibe: los headers x-signature/x-request-id, el data.id de la notificación, y
// el secreto de la app correspondiente (hay uno para tarjeta y otro para QR).
// Devuelve: { valida: true } o { valida: false, razon: "..." } — nunca tira excepción.
export function validarFirmaWebhook(xSignature, xRequestId, dataId, secret)
{
    if (!xSignature)
    {
        return { valida: false, razon: "sin header x-signature" };
    }

    // El header viene como "ts=1234,v1=abc123..." — lo separamos en {ts, v1}.
    const partes = {};
    xSignature.split(',').forEach(function (parte)
    {
        const separador = parte.indexOf('=');
        if (separador === -1)
        {
            return;
        }
        const clave = parte.slice(0, separador).trim();
        const valor = parte.slice(separador + 1).trim();
        partes[clave] = valor;
    });

    const ts = partes.ts;
    const hashRecibido = partes.v1;

    if (!ts || !hashRecibido)
    {
        return { valida: false, razon: "formato de x-signature inválido" };
    }

    // El "manifest" es el texto exacto que Mercado Pago firmó. El id SIEMPRE va en
    // minúsculas (si no, la firma nunca va a coincidir aunque todo lo demás esté bien).
    const idParaFirma = dataId ? dataId.toLowerCase() : '';
    let manifest = `id:${idParaFirma};`;
    if (xRequestId)
    {
        manifest += `request-id:${xRequestId};`;
    }
    manifest += `ts:${ts};`;

    const hashCalculado = crypto.createHmac('sha256', secret || '').update(manifest).digest('hex');

    // Comparación "a prueba de timing attacks": no compara letra por letra con ===.
    const sonIguales = hashCalculado.length === hashRecibido.length
        && crypto.timingSafeEqual(Buffer.from(hashCalculado), Buffer.from(hashRecibido));

    if (!sonIguales)
    {
        return { valida: false, razon: "la firma no coincide" };
    }

    return { valida: true };
}

// Trae el estado completo y actualizado de una Order (status, status_detail,
// total_amount, external_reference, etc.) — la notificación del webhook solo
// trae el id, así que después hay que pedir el resto con esto.
// Recibe: accessToken del emprendedor dueño de esa orden, idOrden (el id de Mercado Pago, ej "ORD...").
// Devuelve: el objeto Order completo.
export async function consultarOrdenService(accessToken, idOrden)
{
    const res = await fetch(`${MP_API_BASE}/v1/orders/${idOrden}`,
    {
        headers: { "Authorization": `Bearer ${accessToken}` }
    });

    const data = await res.json();

    if (!res.ok)
    {
        throw new Error(`No se pudo consultar la orden: (${res.status}) ${JSON.stringify(data)}`);
    }

    return data;
}
