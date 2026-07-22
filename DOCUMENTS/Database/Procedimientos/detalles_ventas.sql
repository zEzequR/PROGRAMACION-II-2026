------------------DETALLE_VENTA------------------------------

--AGREGAR PRODUCTO A LA VENTA
CREATE PROCEDURE spu_agregar_detalle_venta
(
    p_id_venta INT,
    p_id_producto INT,
    p_cantidad INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_precio NUMERIC(18,2);
    v_subtotal NUMERIC(18,2);
    v_tipo_prod VARCHAR(7);
    v_stock INT;
BEGIN
    SELECT precio, tipo_prod INTO v_precio, v_tipo_prod
    FROM Productos
    WHERE id_producto = p_id_producto AND activo = TRUE;

    IF v_precio IS NULL THEN
        RAISE EXCEPTION 'Producto % no existe o no está activo', p_id_producto;
    END IF;

    IF v_tipo_prod = 'FISICO' THEN
        SELECT stock INTO v_stock
        FROM Productos_Fisicos
        WHERE id_producto = p_id_producto;

        IF v_stock < p_cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para el producto % (disponible: %)', p_id_producto, v_stock;
        END IF;
    END IF;

    v_subtotal := v_precio * p_cantidad;

    INSERT INTO Detalle_Venta (id_venta, id_producto, precio_unitario, cantidad, subtotal)
    VALUES (p_id_venta, p_id_producto, v_precio, p_cantidad, v_subtotal)
    ON CONFLICT (id_venta, id_producto)
    DO UPDATE SET
        cantidad = Detalle_Venta.cantidad + p_cantidad,
        subtotal = Detalle_Venta.subtotal + v_subtotal;

    UPDATE Ventas
    SET precio_final = (SELECT COALESCE(SUM(subtotal), 0) FROM Detalle_Venta WHERE id_venta = p_id_venta)
    WHERE id_venta = p_id_venta;
END;
$$;

--QUITAR PRODUCTO DE LA VENTA
CREATE PROCEDURE spu_eliminar_detalle_venta
(
    p_id_venta INT,
    p_id_producto INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM Detalle_Venta
    WHERE id_venta = p_id_venta AND id_producto = p_id_producto;

    UPDATE Ventas
    SET precio_final = (SELECT COALESCE(SUM(subtotal), 0) FROM Detalle_Venta WHERE id_venta = p_id_venta)
    WHERE id_venta = p_id_venta;
END;
$$;