--CREATE DATABASE db_pp2;

CREATE TABLE Ubicaciones
(
    id_ubicacion INT GENERATED ALWAYS AS IDENTITY,
    direccion VARCHAR(255),  
    piso VARCHAR(10),       
    depto VARCHAR(10),
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
    id_cat INT GENERATED ALWAYS AS IDENTITY,
    categoria VARCHAR(80),
    PRIMARY KEY (id_cat)
);

CREATE TABLE Personas
(
    id_persona INT GENERATED ALWAYS AS IDENTITY,
    email VARCHAR(255) UNIQUE NOT NULL,
    psw VARCHAR(255),
    tipo_auth tipo_auth NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    telefono VARCHAR(30),
    id_ubicacion INT,
    activo BOOLEAN NOT NULL,    
    fecha_baja TIMESTAMP DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP(2),
    PRIMARY KEY (id_persona),
    FOREIGN KEY (id_ubicacion) REFERENCES Ubicaciones(id_ubicacion)
);

CREATE TABLE Personas_Intereses
(
    id_persona INT NOT NULL REFERENCES Personas(id_persona),
    id_cat INT NOT NULL REFERENCES Categorias_Productos(id_cat),
    PRIMARY KEY (id_persona, id_cat)
);

CREATE TABLE Emprendedores
(
    id_emprendedor INT GENERATED ALWAYS AS IDENTITY,
    id_persona INT,
    cuit VARCHAR(20),
    mp_access_token TEXT,
    mp_refresh_token TEXT,
    mp_user_id VARCHAR(60),
    mp_public_key VARCHAR(120),
    mp_token_expires_at TIMESTAMP,
    mp_qr_access_token TEXT,
    mp_qr_refresh_token TEXT,
    mp_qr_user_id VARCHAR(60),
    mp_qr_token_expires_at TIMESTAMP,
    mp_qr_store_id VARCHAR(60),
    mp_qr_pos_id VARCHAR(60),
    PRIMARY KEY(id_emprendedor),
    FOREIGN KEY (id_persona) REFERENCES Personas(id_persona)
);

CREATE TABLE Tiendas
(
    id_tienda INT GENERATED ALWAYS AS IDENTITY,
    id_emprendedor INT,
    nombre_tienda  VARCHAR(100),
    logo_tienda    TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    PRIMARY KEY(id_tienda),
    FOREIGN KEY (id_emprendedor) REFERENCES Emprendedores(id_emprendedor)
);

CREATE TABLE Clientes
(
    id_cliente INT GENERATED ALWAYS AS IDENTITY,
    id_persona INT,
    id_tienda INT,
    suscripcion BOOL,
    resend_contact_id VARCHAR(255) DEFAULT NULL,
    fecha_alta TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY(id_cliente),
    FOREIGN KEY(id_tienda) REFERENCES Tiendas(id_tienda),
    FOREIGN KEY (id_persona) REFERENCES Personas(id_persona),
    UNIQUE (id_tienda, id_persona)
);

CREATE TYPE tipo_descuento AS ENUM
('MONTOFIJO', 'PORCENTAJE');

CREATE TABLE Cupones_Descuento
(
    id_cupon_desc INT GENERATED ALWAYS AS IDENTITY,
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
    id_producto INT GENERATED ALWAYS AS IDENTITY,
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
    id_atributo INT GENERATED ALWAYS AS IDENTITY,
    id_cat INT,
    nombre_atributo VARCHAR(60),
    PRIMARY KEY (id_atributo),
    FOREIGN KEY (id_cat) REFERENCES Categorias_Productos(id_cat),
    UNIQUE (id_cat, nombre_atributo)
);

CREATE TABLE Especificaciones_Producto
(
    id_espec INT GENERATED ALWAYS AS IDENTITY,
    id_producto INT,
    id_atributo INT,
    valor VARCHAR(60),
    PRIMARY KEY (id_espec),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto),
    FOREIGN KEY (id_atributo) REFERENCES Atributos_Categoria(id_atributo),
    UNIQUE (id_producto, id_atributo)
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
    id_producto_fisico INT GENERATED ALWAYS AS IDENTITY,
    id_producto INT,
    stock INT,
    PRIMARY KEY (id_producto_fisico),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

CREATE TABLE Licencia_Venta
(
    id_lic_vta INT GENERATED ALWAYS AS IDENTITY,
    id_producto INT,
    clave_digital TEXT,
    clave_usada BOOLEAN,
    PRIMARY KEY (id_lic_vta),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

CREATE TABLE Productos_Digitales (
    id_producto_digital INT GENERATED ALWAYS AS IDENTITY,
    id_producto INT,
    archivo_prod TEXT NOT NULL,
    usa_licencia BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id_producto_digital),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

CREATE TABLE Detalles_Pago
(
    id_det_pago INT GENERATED ALWAYS AS IDENTITY,
    id_transaccion VARCHAR(60) UNIQUE,
    estado VARCHAR(60),
    metodo_pago VARCHAR(60),
    monto NUMERIC(18,2),
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP(2),
    PRIMARY KEY (id_det_pago)
);

CREATE TABLE Pagos
(
    id_pago INT GENERATED ALWAYS AS IDENTITY,
    id_det_pago INT,
    PRIMARY KEY (id_pago),
    FOREIGN KEY (id_det_pago) REFERENCES Detalles_Pago(id_det_pago)
);

CREATE TYPE estado_venta AS ENUM
('ABIERTA', 'CANCELADA', 'CERRADA');

CREATE TABLE Ventas
(
    id_venta INT GENERATED ALWAYS AS IDENTITY,
    fecha_venta DATE,
    id_tienda INT,
    id_cliente INT,
    precio_final NUMERIC(18,2),
    estado estado_venta NOT NULL,
    id_pago INT,
    id_cupon_desc INT,
    PRIMARY KEY(id_venta),
    FOREIGN KEY (id_tienda) REFERENCES Tiendas(id_tienda),
    FOREIGN KEY (id_cupon_desc) REFERENCES Cupones_Descuento(id_cupon_desc) ON DELETE SET NULL,
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