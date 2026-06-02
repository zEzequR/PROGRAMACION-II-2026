CREATE DATABASE db_pp2;

CREATE TYPE tipo_auth AS ENUM
('MANUAL', 'GOOGLE');

CREATE TABLE Personas
(
    id_persona INT,
    email VARCHAR(255) UNIQUE NOT NULL,
    psw VARCHAR(255),
    tipo_auth tipo_auth NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    telefono VARCHAR(30),
    ubicacion JSONB,
    activo BOOLEAN NOT NULL,    
    fecha_baja TIMESTAMP DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP(2),
    PRIMARY KEY (id_persona)
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

CREATE TABLE Categorias_Productos
(
    id_cat INT,
    categoria VARCHAR(80),
    PRIMARY KEY (id_cat)
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
    espec_prod JSONB,
    activo BOOLEAN,
    PRIMARY KEY(id_producto),
    FOREIGN KEY (id_tienda) REFERENCES Tiendas(id_tienda),
    FOREIGN KEY (id_cat) REFERENCES Categorias_Productos(id_cat)
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

CREATE TABLE Pagos
(
    id_pago INT,
    detalles_pago JSONB,
    PRIMARY KEY (id_pago)
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