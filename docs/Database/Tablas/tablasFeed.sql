CREATE TABLE IF NOT EXISTS productos_index (
    id_producto INTEGER PRIMARY KEY,
    id_cat INTEGER NOT NULL,
    id_tienda INTEGER NOT NULL,
    activo INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS index_productos_cat ON productos_index(id_cat);
CREATE INDEX IF NOT EXISTS index_productos_tienda ON productos_index(id_tienda);

-- Mirror de Personas_Intereses
CREATE TABLE IF NOT EXISTS usuario_categorias (
    id_persona INTEGER NOT NULL,
    id_cat INTEGER NOT NULL,
    PRIMARY KEY (id_persona, id_cat)
);

CREATE TABLE IF NOT EXISTS interacciones (
    id_interaccion INTEGER PRIMARY KEY,
    id_persona INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    id_cat INTEGER NOT NULL,
    id_tienda INTEGER NOT NULL,
    tipo_evento TEXT NOT NULL,        -- 'vista' | 'click' | 'favorito' | 'compra'
    puntos INTEGER NOT NULL,
    fecha TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS indice_interacciones_persona ON interacciones(id_persona);
CREATE INDEX IF NOT EXISTS indice_interacciones_producto ON interacciones(id_producto);
CREATE INDEX IF NOT EXISTS indice_interacciones_fecha ON interacciones(fecha);

CREATE TABLE IF NOT EXISTS puntajes_categoria (
    id_persona INTEGER NOT NULL,
    id_cat INTEGER NOT NULL,
    puntaje_total INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (id_persona, id_cat)
);

CREATE TABLE IF NOT EXISTS puntajes_producto (
    id_persona INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    puntaje_total INTEGER NOT NULL DEFAULT 0,
    fecha_actualizacion TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (id_persona, id_producto)
);

CREATE TABLE IF NOT EXISTS puntajes_tienda (
    id_persona INTEGER NOT NULL,
    id_tienda INTEGER NOT NULL,
    puntaje_total INTEGER NOT NULL DEFAULT 0,
    fecha_actualizacion TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (id_persona, id_tienda)
);
