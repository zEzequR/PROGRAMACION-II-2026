CREATE DATABASE db_pp2;

CREATE TABLE Ubicaciones
(
    id_ubicacion INT,
    pais VARCHAR(60),
    provincia VARCHAR(60),
    ciudad VARCHAR(60),
    codigo VARCHAR(60),
    placeid TEXT,
    PRIMARY KEY (id_ubicacion)
);

CREATE TYPE tipo_auth AS ENUM
('MANUAL', 'GOOGLE');

CREATE TABLE Categorias_Productos
(
    id_cat INT,
    categoria VARCHAR(80),
    PRIMARY KEY (id_cat)
);

CREATE TABLE Personas
(
    id_persona INT,
    email VARCHAR(255) UNIQUE NOT NULL,
    psw VARCHAR(255),
    tipo_auth tipo_auth NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    telefono VARCHAR(30),
    id_ubicacion INT,
    id_cat INT,
    activo BOOLEAN NOT NULL,    
    fecha_baja TIMESTAMP DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP(2),
    PRIMARY KEY (id_persona),
    FOREIGN KEY (id_ubicacion) REFERENCES Ubicaciones(id_ubicacion),
    FOREIGN KEY (id_cat) REFERENCES Categorias_Productos(id_cat)
);

CREATE TABLE Emprendedores
(
    id_emprendedor INT,
    id_persona INT,
    cuit VARCHAR(20),
    mp_access_token TEXT,
    PRIMARY KEY(id_emprendedor),
    FOREIGN KEY (id_persona) REFERENCES Personas(id_persona)
);

CREATE TABLE Tiendas
(
    id_tienda INT,
    id_emprendedor INT,
    id_plantilla INT,
    nombre_tienda  VARCHAR(100),  -- "Configuración de datos del negocio"
    logo_tienda    TEXT,          -- "logo"
    personalizacion_tienda JSONB,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id_tienda),
    FOREIGN KEY (id_emprendedor) REFERENCES Emprendedores(id_emprendedor)
);

CREATE TABLE Clientes
(
    id_cliente INT,
    id_persona INT,
    id_tienda INT,
    suscripcion BOOL,
    PRIMARY KEY(id_cliente),
    FOREIGN KEY(id_tienda) REFERENCES Tiendas(id_tienda),
    FOREIGN KEY (id_persona) REFERENCES Personas(id_persona),
    UNIQUE (id_tienda, id_persona)
);

CREATE TYPE tipo_descuento AS ENUM
('MONTOFIJO', 'PORCENTAJE');

CREATE TABLE Cupones_Descuento
(
    id_cupon_desc INT,
    id_tienda INT NOT NULL,
    codigo VARCHAR(255) NOT NULL,
    tipo tipo_descuento NOT NULL,    
    valor DECIMAL(18,2) NOT NULL,
    fecha_expiracion DATE,
    usos_maximos INT,
    usos_actuales INT,
    PRIMARY KEY(id_cupon_desc),
    FOREIGN KEY (id_tienda) REFERENCES Tiendas(id_tienda)
);

CREATE TABLE Productos
(
    id_producto INT,
    id_tienda INT,
    id_cat INT,
    tipo_prod VARCHAR(7) NOT NULL,
    nombre_prod VARCHAR(60) NOT NULL,
    imagen_prod TEXT NOT NULL,
    descrip_prod VARCHAR(255),
    precio NUMERIC(18,2) NOT NULL,
    activo BOOLEAN,
    PRIMARY KEY(id_producto),
    FOREIGN KEY (id_tienda) REFERENCES Tiendas(id_tienda),
    FOREIGN KEY (id_cat) REFERENCES Categorias_Productos(id_cat)
);

CREATE TABLE Atributos_Categoria
(
    id_atributo INT,
    id_cat INT,
    nombre_atributo VARCHAR(60),
    PRIMARY KEY (id_atributo),
    FOREIGN KEY (id_cat) REFERENCES Categorias_Productos(id_cat)
);

CREATE TABLE Especificaciones_Producto
(
    id_espec INT,
    id_producto INT,
    id_atributo INT,
    valor VARCHAR(60),
    PRIMARY KEY (id_espec),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto),
    FOREIGN KEY (id_atributo) REFERENCES Atributos_Categoria(id_atributo)
);

CREATE TABLE Cupones_Descuentos_Productos
(
    id_cupon_desc INT,
    id_producto INT,
    PRIMARY KEY (id_cupon_desc, id_producto),
    FOREIGN KEY (id_cupon_desc) REFERENCES Cupones_Descuento(id_cupon_desc),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

CREATE TABLE Productos_Fisicos (
    id_producto_fisico INT,
    id_producto INT,
    stock INT,
    PRIMARY KEY (id_producto_fisico),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

CREATE TABLE Licencia_Venta
(
    id_lic_vta INT,
    clave_digital TEXT,
    clave_usada BOOLEAN,
    PRIMARY KEY (id_lic_vta)
);

CREATE TABLE Productos_Digitales (
    id_producto_digital INT,
    id_producto INT,
    id_lic_vta INT,
    archivo_prod TEXT NOT NULL,
    PRIMARY KEY (id_producto_digital),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto),
    FOREIGN KEY (id_lic_vta) REFERENCES Licencia_Venta(id_lic_vta)
);

CREATE TABLE Detalles_Pago
(
    id_det_pago INT,
    id_transaccion INT UNIQUE,
    estado VARCHAR(60),
    metodo_pago VARCHAR(60),
    monto NUMERIC(18,2),
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP(2),
    PRIMARY KEY (id_det_pago)
);

CREATE TABLE Pagos
(
    id_pago INT,
    id_det_pago INT,
    PRIMARY KEY (id_pago),
    FOREIGN KEY (id_det_pago) REFERENCES Detalles_Pago(id_det_pago)
);

CREATE TYPE estado_venta AS ENUM
('ABIERTA', 'CANCELADA', 'CERRADA');

CREATE TABLE Ventas
(
    id_venta INT,
    fecha_venta DATE,
    id_tienda INT,
    id_cliente INT,
    precio_final NUMERIC(18,2),
    estado estado_venta NOT NULL,
    id_pago INT,
    PRIMARY KEY(id_venta),
    FOREIGN KEY (id_tienda) REFERENCES Tiendas(id_tienda),
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente),
    FOREIGN KEY (id_pago) REFERENCES Pagos(id_pago)
);

CREATE TABLE Detalle_Venta
(
    id_venta INT,
    id_producto INT,
    precio_unitario NUMERIC(18,2),
    cantidad INT,
    subtotal NUMERIC(18,2),
    id_lic_vta INT,
    PRIMARY KEY (id_venta, id_producto),
    FOREIGN KEY (id_venta) REFERENCES Ventas(id_venta),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto),
    FOREIGN KEY (id_lic_vta) REFERENCES Licencia_Venta(id_lic_vta)
);

CREATE TABLE tarjetas_pagos
(
    id_tarjeta INT,
    id_cliente INT,
    servicio VARCHAR(20) NOT NULL,
    servicio_cliente_id VARCHAR(255) NOT NULL,     -- ID del cliente en MP/Stripe
    servicio_tarjeta_id TEXT NOT NULL,             -- ID de la tarjeta en MP/Stripe
    ult_digitos_tarjeta CHAR(4),                   -- para mostrar "terminada en 3704"
    marca_tarjeta VARCHAR(12),                     -- 'visa', 'mastercard'
    expira_mes INT,
    expira_ano INT,
    por_defecto BOOLEAN,
    PRIMARY KEY (id_tarjeta),
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente)
);

SELECT * FROM Personas


------------------TIENDAS------------------------------
--CREAR
CREATE PROCEDURE spu_crear_tienda
(
    p_id_emprendedor INT,
    p_id_plantilla INT,
    p_nombre_tienda  VARCHAR(100),
    p_logo_tienda    TEXT,
    p_personalizacion_tienda JSONB,
    p_fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Tiendas
    VALUES(p_id_emprendedor, p_id_plantilla, p_nombre_tienda,
    p_logo_tienda, p_personalizacion_tienda, p_fecha_creacion
    );
END;
$$;

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
    id_plantilla = p_id_plantilla,
    nombre_tienda = p_nombre_tienda,
    logo_tienda = p_logo_tienda,
    personalizacion_tienda = p_personalizacion_tienda
    WHERE id_tienda = p_id_tienda;
END;
$$;

--ELIMINAR


------------------PRODUCTOS------------------------------
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
    p_clave_digital VARCHAR(100) DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_nuevo_id_producto INT; 
    v_nueva_licencia_id INT;
BEGIN
    INSERT INTO productos
    VALUES(
        p_id_tienda, p_id_cat, p_tipo_prod, p_nombre_prod, 
        p_imagen_prod, p_descrip_prod, p_precio, p_activo
    )
    RETURNING id_producto INTO v_nuevo_id_producto;

    CASE p_tipo_prod 
        WHEN 'FISICO' THEN
            INSERT INTO Productos_Fisicos
            VALUES (v_nuevo_id_producto, p_stock);

        WHEN 'DIGITAL' THEN
            INSERT INTO Licencia_Venta
            VALUES (p_clave_digital, FALSE)
            RETURNING id_lic_vta INTO v_nueva_licencia_id;

            INSERT INTO productos_digitales
            VALUES (v_nuevo_id_producto, v_nueva_licencia_id, p_archivo_prod);
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
    p_activo BOOLEAN,
    p_stock INT DEFAULT NULL,
    p_archivo_prod TEXT DEFAULT NULL,
    p_clave_digital VARCHAR(100) DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_tipo_actual VARCHAR(7);
BEGIN
    SELECT tipo_prod INTO v_tipo_actual 
    FROM Productos 
    WHERE id_tienda = p_id_tienda AND id_producto = p_id_producto;

    UPDATE Productos SET
        id_cat = p_id_cat,
        nombre_prod = p_nombre_prod,
        imagen_prod = p_imagen_prod,
        descrip_prod = p_descrip_prod,
        precio = p_precio,
        activo = p_activo
    WHERE id_tienda = p_id_tienda AND id_producto = p_id_producto;

    CASE p_tipo_prod 
        WHEN 'FISICO' THEN
            UPDATE Productos_Fisicos SET
            stock = p_stock
            WHERE id_producto = p_id_producto;

        WHEN 'DIGITAL' THEN
            UPDATE productos_Digitales SET 
            archivo_prod = p_archivo_prod
            WHERE id_producto = p_id_producto;
            
    END CASE;
END;
$$;

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
            INSERT INTO cupones_descuento
            VALUES(
            p_codigo, p_tipo, p_valor, p_fecha_expiracion, p_usos_maximos, 0
            );

        WHEN 'PRODUCTO' THEN
            INSERT INTO cupones_descuento
            VALUES(
                p_codigo, p_tipo, p_valor, p_fecha_expiracion, p_usos_maximos, 0
            )
            RETURNING id_cupon_desc INTO v_id_cupon_desc;

            FOREACH p_id_producto IN ARRAY p_aplica_a_producto
            LOOP
                INSERT INTO cupones_descuentos_productos
                VALUES (v_id_cupon_desc, p_id_producto);
            END LOOP;
    END CASE;
END;
$$;

--Eliminar
CREATE PROCEDURE spu_eliminar_cupon_descuento
(
    p_id_cupon_desc INT,
    p_id_tienda INT,
    p_aplica_producto BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    CASE p_aplica_producto
        WHEN FALSE THEN
            DELETE FROM cupones_descuento
            WHERE id_cupon_desc = p_id_cupon_desc
            AND id_tienda = p_id_tienda;

        WHEN TRUE THEN
            DELETE FROM cupones_descuentos_productos
            WHERE id_cupon_desc = p_id_cupon_desc;

            DELETE FROM cupones_descuento
            WHERE id_cupon_desc = p_id_cupon_desc
            AND id_tienda = p_id_tienda;
    END CASE;
END;
$$;

--MODIFICAR
CREATE PROCEDURE spu_modificar_cupon_descuento(
    p_id_producto INT,
    p_id_cupon_desc INT,
    p_id_tienda INT,
    p_codigo VARCHAR(255),
    p_tipo tipo_descuento,
    p_valor DECIMAL(18,2),
    p_fecha_expiracion DATE,
    p_usos_maximos INT,
    p_aplica_producto BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE cupones_descuento
    SET
    codigo = p_codigo,
    tipo = p_tipo,
    valor = p_valor,
    fecha_expiracion = p_fecha_expiracion,
    usos_maximos = p_usos_maximos
    WHERE id_cupon_desc = p_id_cupon_desc
    AND id_tienda = p_id_tienda;

    IF p_aplica_producto THEN
        UPDATE cupones_descuentos_productos SET
        id_producto = p_id_producto
        WHERE id_cupon_desc = p_id_cupon_desc;
    END IF;
END;
$$;

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
BEGIN
    INSERT INTO atributos_categoria
    VALUES (p_id_cat, p_nombre_atributo)
    RETURNING id_atributo INTO v_id_atributo;

    INSERT INTO Especificaciones_Producto
    VALUES (p_id_producto, v_id_atributo, p_valor);
END;
$$;

--VISTAS
CREATE VIEW vw_obtener_categorias AS
SELECT categoria
FROM Categorias_Productos;


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