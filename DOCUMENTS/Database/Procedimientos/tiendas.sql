------------------TIENDAS------------------------------
--CREAR
CREATE FUNCTION fn_crear_tienda
(
    p_id_persona INT,
    p_cuit VARCHAR(20),
    p_id_plantilla INT,
    p_nombre_tienda  VARCHAR(100),
    p_logo_tienda    TEXT,
    p_personalizacion_tienda JSONB
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_emprendedor INT;
    v_id_tienda INT;
BEGIN
    INSERT INTO Emprendedores (id_persona, cuit)
    VALUES (p_id_persona, p_cuit)
    RETURNING id_emprendedor INTO v_id_emprendedor;

    INSERT INTO Tiendas(id_emprendedor, id_plantilla,
    nombre_tienda, logo_tienda, personalizacion_tienda)
    VALUES(v_id_emprendedor, p_id_plantilla, p_nombre_tienda,
    p_logo_tienda, p_personalizacion_tienda
    )
    RETURNING id_tienda INTO v_id_tienda;

    RETURN v_id_tienda;
END;
$$;

SELECT * FROM tiendas
SELECT * FROM emprendedores
DELETE FROM tiendas
DELETE FROM tiendas WHERE tiendas.id_emprendedor = 13
DELETE FROM emprendedores WHERE emprendedores.id_persona = 2
SELECT * FROM productos

--MODIFICAR
CREATE PROCEDURE spu_modificar_tienda
(
    p_id_tienda INT,
    p_id_plantilla INT,
    p_nombre_tienda  VARCHAR(100),
    p_logo_tienda    TEXT,
    p_personalizacion_tienda JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Tiendas SET
        id_plantilla = COALESCE(p_id_plantilla, id_plantilla),        
        nombre_tienda = COALESCE(p_nombre_tienda, nombre_tienda),        
        logo_tienda = COALESCE(p_logo_tienda, logo_tienda),        
        personalizacion_tienda = 
        COALESCE(p_personalizacion_tienda, personalizacion_tienda)
    WHERE id_tienda = p_id_tienda;
END;
$$;

--ELIMINAR
CREATE PROCEDURE spu_eliminar_tienda
(
    p_id_tienda INT,
    p_meses_inactividad INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_ultima_venta DATE;
BEGIN
    SELECT MAX(fecha_venta) INTO v_ultima_venta
    FROM Ventas
    WHERE id_tienda = p_id_tienda;

    IF v_ultima_venta IS NOT NULL AND v_ultima_venta >= (CURRENT_DATE - make_interval(months => p_meses_inactividad)) THEN
        RAISE EXCEPTION 'No se puede dar de baja la tienda. Su última venta fue el %, hace menos de % meses.', v_ultima_venta, p_meses_inactividad;
    END IF;

    UPDATE Tiendas 
    SET activo = FALSE
    WHERE id_tienda = p_id_tienda;

    UPDATE Productos
    SET activo = FALSE
    WHERE id_tienda = p_id_tienda;
END;
$$;

--REACTIVAR
CREATE PROCEDURE spu_reactivar_tienda
(
    p_id_tienda INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Tiendas
    SET activo = TRUE
    WHERE id_tienda = p_id_tienda;

    UPDATE Productos
    SET activo = TRUE
    WHERE id_tienda = p_id_tienda;
END;
$$;