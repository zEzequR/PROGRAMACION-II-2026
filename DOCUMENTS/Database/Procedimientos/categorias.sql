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



SELECT * FROM categorias_productos;
SELECT * FROM atributos_categoria;
SELECT * FROM especificaciones_producto;

INSERT INTO Categorias_Productos (categoria) VALUES 
('Indumentaria y Accesorios'), -- ID 1
('Tecnología y Electrónica'),  -- ID 2
('Hogar y Decoración'),        -- ID 3
('Deporte y Fitness'),         -- ID 4
('Mascotas'),                  -- ID 5
('Salud y Belleza'),           -- ID 6
('Alimentos y Bebidas'),       -- ID 7
('Autopartes'),                -- ID 8
('Arte y Papelería'),          -- ID 9
('Productos Digitales'),       -- ID 10
('Servicios y Asesorías'),     -- ID 11
('Otros');                     -- ID 12


INSERT INTO Atributos_Categoria (id_cat, nombre_atributo) VALUES 
-- ID 1: Indumentaria y Accesorios 
(1, 'Talle'), (1, 'Color'), (1, 'Material'), (1, 'Género'), (1, 'Marca'), (1, 'Condición'),

-- ID 2: Tecnología y Electrónica 
(2, 'Marca'), (2, 'Modelo'), (2, 'Garantía'), (2, 'Color'), (2, 'Condición'),

-- ID 3: Hogar y Decoración 
(3, 'Material'), (3, 'Dimensiones (Alto x Ancho x Largo)'), (3, 'Peso'), (3, 'Estilo'), (3, 'Condición'),

-- ID 4: Deporte y Fitness 
(4, 'Deporte'), (4, 'Peso/Resistencia'), (4, 'Material'), (4, 'Talla/Medida'), (4, 'Condición'),

-- ID 5: Mascotas 
(5, 'Tipo de mascota (Perro, Gato, etc.)'), (5, 'Tamaño/Medida'), (5, 'Material'), (5, 'Etapa de vida'), (5, 'Condición'),

-- ID 6: Salud y Belleza
(6, 'Volumen neto'), (6, 'Tipo de piel/cabello'), (6, 'Hipoalergénico'), (6, 'Cruelty-Free'),

-- ID 7: Alimentos y Bebidas
(7, 'Peso neto'), (7, 'Fecha de vencimiento'), (7, 'Sin TACC'), (7, 'Vegano'),

-- ID 8: Autopartes
(8, 'Marca'), (8, 'Modelo'), (8, 'País de fabricación'), (8, 'Categoría (freno, motor, etc)'), (8, 'Estado'), (8, 'Garantía'),

-- ID 9: Arte y Papelería
(9, 'Tipo de papel/lienzo'), (9, 'Técnica'), (9, 'Dimensiones'), (9, 'Enmarcado'),

-- ID 10: Productos Digitales
(10, 'Formato (PDF, MP4, etc.)'), (10, 'Idioma'), (10, 'Tamaño de archivo'), (10, 'Requisitos'),

-- ID 11: Servicios y Asesorías
(11, 'Modalidad'), (11, 'Duración'), (11, 'Nivel'),

-- ID 12: Otros 
(12, 'Condición');