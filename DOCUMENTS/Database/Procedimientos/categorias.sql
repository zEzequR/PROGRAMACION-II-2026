------------------CATEGORIAS------------------------------
--CATEGORIAS PREDEFINIDAS
INSERT INTO Categorias_Productos
VALUES

--CREAR
CREATE PROCEDURE spu_crear_especificaciones_producto
(
    p_id_cat INT,
    p_nombre_atributo VARCHAR(60),
    p_valor VARCHAR(60),
    p_id_producto INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_atributo INT;
    v_id_espec INT;
BEGIN
    SELECT id_atributo INTO v_id_atributo
    FROM Atributos_Categoria
    WHERE id_cat = p_id_cat AND nombre_atributo = p_nombre_atributo;


    IF v_id_atributo IS NULL THEN
        INSERT INTO Atributos_Categoria (id_cat, nombre_atributo)
        VALUES (p_id_cat, p_nombre_atributo)
        RETURNING id_atributo INTO v_id_atributo;
    END IF;

    SELECT id_espec INTO v_id_espec
    FROM Especificaciones_Producto
    WHERE id_producto = p_id_producto AND id_atributo = v_id_atributo;

    IF v_id_espec IS NOT NULL THEN
        UPDATE Especificaciones_Producto 
        SET valor = p_valor 
        WHERE id_espec = v_id_espec;        
    ELSE
        INSERT INTO Especificaciones_Producto (id_producto, id_atributo, valor)
        VALUES (p_id_producto, v_id_atributo, p_valor);
    END IF;
END;
$$;

--VISTAS
CREATE VIEW vw_obtener_categorias AS
SELECT categoria
FROM Categorias_Productos;

SELECT * FROM categorias_productos