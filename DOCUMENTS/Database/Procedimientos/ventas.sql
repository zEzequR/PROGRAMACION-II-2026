------------------VENTAS------------------------------

--CREAR
CREATE FUNCTION fn_crear_venta
(
    p_id_tienda INT,
    p_id_cliente INT
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_venta INT;
BEGIN
    INSERT INTO Ventas (fecha_venta, id_tienda, id_cliente, precio_final, estado)
    VALUES (CURRENT_DATE, p_id_tienda, p_id_cliente, 0, 'ABIERTA')
    RETURNING id_venta INTO v_id_venta;

    RETURN v_id_venta;
END;
$$;

--CERRAR
CREATE PROCEDURE spu_cerrar_venta
(
    p_id_venta INT,
    p_id_pago INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    r RECORD;
    v_id_lic_vta INT;
BEGIN
    FOR r IN
        SELECT dv.id_producto, dv.cantidad, p.tipo_prod
        FROM Detalle_Venta dv
        JOIN Productos p ON p.id_producto = dv.id_producto
        WHERE dv.id_venta = p_id_venta
    LOOP
        IF r.tipo_prod = 'FISICO' THEN
            UPDATE Productos_Fisicos
            SET stock = stock - r.cantidad
            WHERE id_producto = r.id_producto;

        ELSIF r.tipo_prod = 'DIGITAL' THEN
            SELECT lv.id_lic_vta INTO v_id_lic_vta
            FROM Productos_Digitales pd
            JOIN Licencia_Venta lv ON lv.id_lic_vta = pd.id_lic_vta
            WHERE pd.id_producto = r.id_producto
            AND lv.clave_usada = FALSE
            LIMIT 1;

            IF v_id_lic_vta IS NOT NULL THEN
                UPDATE Licencia_Venta SET clave_usada = TRUE WHERE id_lic_vta = v_id_lic_vta;

                UPDATE Detalle_Venta
                SET id_lic_vta = v_id_lic_vta
                WHERE id_venta = p_id_venta AND id_producto = r.id_producto;
            ELSE
                RAISE EXCEPTION 'No hay licencias disponibles para el producto %', r.id_producto;
            END IF;
        END IF;
    END LOOP;

    UPDATE Ventas
    SET estado = 'CERRADA', id_pago = p_id_pago
    WHERE id_venta = p_id_venta;
END;
$$;

--CANCELAR
CREATE PROCEDURE spu_cancelar_venta
(
    p_id_venta INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Ventas
    SET estado = 'CANCELADA'
    WHERE id_venta = p_id_venta
    AND estado = 'ABIERTA';
END;
$$;

--OBTENER
CREATE FUNCTION fn_obtener_venta(p_id_venta INT)
RETURNS TABLE (
    id_venta INT,
    fecha_venta DATE,
    id_tienda INT,
    id_cliente INT,
    precio_final NUMERIC(18,2),
    estado estado_venta,
    id_producto INT,
    nombre_prod VARCHAR(60),
    precio_unitario NUMERIC(18,2),
    cantidad INT,
    subtotal NUMERIC(18,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT v.id_venta, v.fecha_venta, v.id_tienda, v.id_cliente, v.precio_final, v.estado,
           dv.id_producto, p.nombre_prod, dv.precio_unitario, dv.cantidad, dv.subtotal
    FROM Ventas v
    LEFT JOIN Detalle_Venta dv ON dv.id_venta = v.id_venta
    LEFT JOIN Productos p ON p.id_producto = dv.id_producto
    WHERE v.id_venta = p_id_venta;
END;
$$;

--OBTENER VENTAS DE UN CLIENTE
CREATE FUNCTION fn_obtener_ventas_cliente(p_id_cliente INT)
RETURNS TABLE (
    id_venta INT,
    fecha_venta DATE,
    id_tienda INT,
    precio_final NUMERIC(18,2),
    estado estado_venta
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT v.id_venta, v.fecha_venta, v.id_tienda, v.precio_final, v.estado
    FROM Ventas v
    WHERE v.id_cliente = p_id_cliente
    ORDER BY v.fecha_venta DESC;
END;
$$;