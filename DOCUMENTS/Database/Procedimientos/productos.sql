------------------PRODUCTOS------------------------------
INSERT INTO categorias_productos (categoria)
VALUES ('HOLA');

SELECT * FROM categorias_productos
SELECT * FROM tiendas
--CREAR
CREATE PROCEDURE spu_crear_producto(
    p_id_tienda INT,
    p_id_cat INT,
    p_tipo_prod VARCHAR(7),
    p_nombre_prod VARCHAR(60),
    p_imagen_prod TEXT,
    p_descrip_prod VARCHAR(255),
    p_precio NUMERIC(18,2),
    p_activo BOOLEAN,
    p_stock INT DEFAULT NULL,
    p_archivo_prod TEXT DEFAULT NULL,
    p_usa_licencia BOOLEAN DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_nuevo_id_producto INT; 
    v_nueva_licencia_id INT;
BEGIN
INSERT INTO Productos (id_tienda, id_cat, tipo_prod, nombre_prod, imagen_prod, descrip_prod, precio, activo)
    VALUES (p_id_tienda, p_id_cat, p_tipo_prod, p_nombre_prod, p_imagen_prod, p_descrip_prod, p_precio, p_activo)
    RETURNING id_producto INTO v_nuevo_id_producto;

    CASE p_tipo_prod 
        WHEN 'FISICO' THEN
            INSERT INTO Productos_Fisicos (id_producto, stock)
            VALUES (v_nuevo_id_producto, p_stock);

        WHEN 'DIGITAL' THEN
            INSERT INTO Productos_Digitales(id_producto, archivo_prod, usa_licencia)
            VALUES (v_nuevo_id_producto, p_archivo_prod, p_usa_licencia);
    END CASE;
END;
$$;

--MODIFICAR
CREATE PROCEDURE spu_modificar_producto(
    p_id_tienda INT,
    p_id_producto INT,
    p_id_cat INT,
    p_tipo_prod VARCHAR(7),
    p_nombre_prod VARCHAR(60),
    p_imagen_prod TEXT,
    p_descrip_prod VARCHAR(255),
    p_precio NUMERIC(18,2),
    p_stock INT DEFAULT NULL,
    p_archivo_prod TEXT DEFAULT NULL,
    p_usa_licencia BOOLEAN DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_tipo_actual VARCHAR(7);
    v_id_lic_vta INT;
BEGIN
    SELECT tipo_prod INTO v_tipo_actual
    FROM Productos
    WHERE id_tienda = p_id_tienda AND id_producto = p_id_producto;

    UPDATE Productos SET
        id_cat = COALESCE(p_id_cat, id_cat),
        nombre_prod = COALESCE(p_nombre_prod, nombre_prod),
        imagen_prod = COALESCE(p_imagen_prod, imagen_prod),
        descrip_prod = COALESCE(p_descrip_prod, descrip_prod),
        precio = COALESCE(p_precio, precio)
    WHERE id_tienda = p_id_tienda AND id_producto = p_id_producto;

    CASE v_tipo_actual
        WHEN 'FISICO' THEN
            UPDATE Productos_Fisicos SET
                stock = COALESCE(p_stock, stock)
            WHERE id_producto = p_id_producto;

        WHEN 'DIGITAL' THEN
            UPDATE Productos_Digitales SET
                archivo_prod = COALESCE(p_archivo_prod, archivo_prod),
                usa_licencia = COALESCE(p_usa_licencia, usa_licencia)
            WHERE id_producto = p_id_producto;

            SELECT id_lic_vta INTO v_id_lic_vta
            FROM Licencia_Venta
            WHERE id_producto = p_id_producto;

            IF p_usa_licencia IS FALSE THEN
                DELETE FROM Licencia_Venta
                WHERE id_producto = p_id_producto
                AND clave_usada = FALSE;
            END IF;
    END CASE;
END;
$$;

SELECT * FROM productos
UPDATE productos SET activo = TRUE 
WHERE productos.id_producto = 1

--ELIMINAR
CREATE PROCEDURE spu_eliminar_producto
(
    p_id_producto INT,
    p_id_tienda INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Productos SET
    activo = FALSE
    WHERE id_tienda = p_id_tienda
    AND id_producto = p_id_producto;
END;
$$;

--REACTIVAR
CREATE PROCEDURE spu_reactivar_producto
(
    p_id_producto INT,
    p_id_tienda INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Productos SET
    activo = TRUE
    WHERE id_tienda = p_id_tienda
    AND id_producto = p_id_producto;
END;
$$;

--VISTAS
CREATE VIEW vw_obtener_productos AS
SELECT nombre_prod, precio, imagen_prod
FROM Productos WHERE activo = TRUE;

CREATE FUNCTION fn_ver_productos_por_filtros(
    p_id_tienda INT,
    p_id_cat INT,
    p_tipo_prod VARCHAR(7),
    p_nombre_prod VARCHAR(60),
    p_activo BOOLEAN,
    p_precio_min NUMERIC(18,2),
    p_precio_max NUMERIC(18,2),
    p_aplica_cupon BOOLEAN
)
RETURNS TABLE (
    nombre_prod VARCHAR(60),
    imagen_prod TEXT,
    precio NUMERIC(18,2),
    tipo_prod VARCHAR(7),
    descrip_prod VARCHAR(255),
    categoria VARCHAR(80),
    nombre_tienda VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        Productos.nombre_prod,
        Productos.imagen_prod,
        Productos.precio,
        Productos.tipo_prod,
        Productos.descrip_prod,
        Categorias_Productos.categoria,
        Tiendas.nombre_tienda
    FROM Productos
    JOIN Categorias_Productos ON Productos.id_cat = Categorias_Productos.id_cat
    JOIN Tiendas ON Productos.id_tienda = Tiendas.id_tienda
    WHERE Productos.id_tienda = p_id_tienda
    AND (p_id_cat IS NULL OR Productos.id_cat = p_id_cat)
    AND (p_tipo_prod IS NULL OR Productos.tipo_prod = p_tipo_prod)
    AND (p_nombre_prod IS NULL OR Productos.nombre_prod ILIKE '%' || p_nombre_prod || '%')
    AND (p_activo IS NULL OR Productos.activo = p_activo)
    AND (p_precio_min IS NULL OR Productos.precio >= p_precio_min)
    AND (p_precio_max IS NULL OR Productos.precio <= p_precio_max)
    AND (p_aplica_cupon IS NULL OR
        (p_aplica_cupon = TRUE AND
        Productos.id_producto IN (SELECT id_producto FROM Cupones_Descuentos_Productos)));
END;
$$;

SELECT * FROM Productos;
SELECT * FROM productos_digitales;
SELECT * FROM productos_fisicos;