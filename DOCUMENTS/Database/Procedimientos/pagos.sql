------------------PAGOS------------------------------
--Crear
CREATE PROCEDURE spu_crear_pago
(
    p_id_transaccion INT,
    p_estado VARCHAR(60),
    p_metodo_pago VARCHAR(60),
    p_monto NUMERIC(18,2),
    p_fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP(2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_det_pago INT
BEGIN
    INSERT INTO detalles_pago
    VALUES (p_id_transaccion, p_estado, p_metodo_pago,
    p_monto, p_fecha_pago)
    RETURNING id_det_pago INTO v_id_det_pago;

    INSERT INTO pagos
    VALUES (v_id_det_pago);
END;
$$;

--ACTUALIZAR

CREATE PROCEDURE spu_actualizar_pago
(
    p_id_det_pago INT,
    p_id_transaccion INT,
    p_estado VARCHAR(60)
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE detalles_pago SET
    estado = p_estado
    WHERE id_det_pago = p_id_det_pago
    AND id_transaccion = p_id_transaccion;
END;
$$;