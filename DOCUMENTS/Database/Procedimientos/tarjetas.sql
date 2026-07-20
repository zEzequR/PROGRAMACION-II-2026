------------------TARJETAS_PAGOS------------------------------
--GUARDAR
CREATE PROCEDURE spu_guardar_tarjeta_cliente
(
    p_id_cliente INT,
    p_servicio VARCHAR(20),
    p_servicio_cliente_id VARCHAR(255),
    p_servicio_tarjeta_id TEXT,
    p_ult_digitos_tarjeta CHAR(4),
    p_marca_tarjeta VARCHAR(12),
    p_expira_mes INT,
    p_expira_ano INT,
    p_por_defecto BOOLEAN,
    p_issuer_id VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_por_defecto THEN
        UPDATE tarjetas_pagos
        SET por_defecto = FALSE
        WHERE id_cliente = p_id_cliente;
    END IF;

    INSERT INTO tarjetas_pagos
    (id_cliente, servicio, servicio_cliente_id, servicio_tarjeta_id,
     ult_digitos_tarjeta, marca_tarjeta, expira_mes, expira_ano, por_defecto, issuer_id)
    VALUES
    (p_id_cliente, p_servicio, p_servicio_cliente_id, p_servicio_tarjeta_id,
     p_ult_digitos_tarjeta, p_marca_tarjeta, p_expira_mes, p_expira_ano, p_por_defecto, p_issuer_id);
END;
$$;

CREATE FUNCTION fn_obtener_tarjetas_cliente(p_id_cliente INT)
RETURNS TABLE (
    id_tarjeta INT,
    servicio_cliente_id VARCHAR(255),
    servicio_tarjeta_id TEXT,
    ult_digitos_tarjeta CHAR(4),
    marca_tarjeta VARCHAR(12),
    expira_mes INT,
    expira_ano INT,
    por_defecto BOOLEAN,
    issuer_id VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT t.id_tarjeta, t.servicio_cliente_id, t.servicio_tarjeta_id,
           t.ult_digitos_tarjeta, t.marca_tarjeta, t.expira_mes, t.expira_ano, t.por_defecto, t.issuer_id
    FROM tarjetas_pagos t
    WHERE t.id_cliente = p_id_cliente
    AND t.servicio = 'mercadopago';
END;
$$;