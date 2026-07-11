------------------CUPONES_DESCUENTO------------------------------
--CREAR
CREATE PROCEDURE spu_crear_cupon_descuento(
    p_id_tienda INT,
    p_codigo VARCHAR(255),
    p_tipo tipo_descuento,
    p_valor DECIMAL(18,2),
    p_fecha_expiracion DATE,
    p_usos_maximos INT,
    p_aplica VARCHAR(10),
    p_aplica_a_producto INT[]
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_cupon_desc INT;
    p_id_producto INT;
BEGIN
CASE p_aplica
        WHEN 'TIENDA' THEN
            INSERT INTO cupones_descuento (id_tienda, codigo, tipo, valor, fecha_expiracion, usos_maximos, usos_actuales)
            VALUES (p_id_tienda, p_codigo, p_tipo, p_valor, p_fecha_expiracion, p_usos_maximos, 0);

        WHEN 'PRODUCTO' THEN
            INSERT INTO cupones_descuento (id_tienda, codigo, tipo, valor, fecha_expiracion, usos_maximos, usos_actuales)
            VALUES (p_id_tienda, p_codigo, p_tipo, p_valor, p_fecha_expiracion, p_usos_maximos, 0)
            RETURNING id_cupon_desc INTO v_id_cupon_desc;

            FOREACH p_id_producto IN ARRAY p_aplica_a_producto
            LOOP
                INSERT INTO cupones_descuentos_productos (id_cupon_desc, id_producto)
                VALUES (v_id_cupon_desc, p_id_producto);
            END LOOP;
    END CASE;
END;
$$;

SELECT * FROM cupones_descuentos_productos;
SELECT * FROM cupones_descuento;

--Eliminar
CREATE PROCEDURE spu_eliminar_cupon_descuento
(
    p_id_cupon_desc INT,
    p_id_tienda INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS(
        SELECT 1 
        FROM  cupones_descuentos_productos
        WHERE id_cupon_desc = p_id_cupon_desc
    ) THEN
        DELETE FROM cupones_descuentos_productos
        WHERE id_cupon_desc = p_id_cupon_desc;

        DELETE FROM cupones_descuento
        WHERE id_cupon_desc = p_id_cupon_desc
        AND id_tienda = p_id_tienda;
    ELSE
        DELETE FROM cupones_descuento
        WHERE id_cupon_desc = p_id_cupon_desc
        AND id_tienda = p_id_tienda;
    END IF;
END;
$$;

--MODIFICAR
CREATE PROCEDURE spu_modificar_cupon_descuento(
    p_id_cupon_desc INT,
    p_id_tienda INT,
    p_codigo VARCHAR(255),
    p_tipo tipo_descuento,
    p_valor DECIMAL(18,2),
    p_fecha_expiracion DATE,
    p_usos_maximos INT,
    p_usos_actuales INT,
    p_aplica_producto BOOLEAN,
    p_productos_aplicados INT[]
)
LANGUAGE plpgsql
AS $$
DECLARE
    p_id_producto INT;
BEGIN
    UPDATE cupones_descuento
    SET
    codigo = COALESCE(p_codigo, codigo),
    tipo = COALESCE(p_tipo, tipo),
    valor = COALESCE(p_valor, valor),
    fecha_expiracion = COALESCE(p_fecha_expiracion, fecha_expiracion),
    usos_maximos = COALESCE(p_usos_maximos, usos_maximos),
    usos_actuales = COALESCE(p_usos_actuales, usos_actuales)
    WHERE id_cupon_desc = p_id_cupon_desc
    AND id_tienda = p_id_tienda;

    IF p_aplica_producto IS TRUE AND array_length(p_productos_aplicados, 1) > 0 THEN
        DELETE FROM cupones_descuentos_productos
        WHERE id_cupon_desc = p_id_cupon_desc;
        FOREACH p_id_producto IN ARRAY p_productos_aplicados
        LOOP
            INSERT INTO cupones_descuentos_productos (id_cupon_desc, id_producto)
            VALUES (p_id_cupon_desc, p_id_producto);
        END LOOP;
    ELSIF p_aplica_producto IS FALSE THEN
        DELETE FROM cupones_descuentos_productos
        WHERE id_cupon_desc = p_id_cupon_desc;
    END IF;
END;
$$;

SELECT * FROM cupones_descuento
SELECT * FROM cupones_descuentos_productos
SELECT * FROM productos