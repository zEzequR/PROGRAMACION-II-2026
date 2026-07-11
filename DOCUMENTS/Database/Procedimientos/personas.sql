--CREAR
CREATE PROCEDURE spu_crear_persona
(
    p_pais VARCHAR(60),
    p_provincia VARCHAR(60),
    p_ciudad VARCHAR(60),
    p_codigo VARCHAR(60),
    p_placeid TEXT,

    p_email VARCHAR(255) UNIQUE,
    p_psw VARCHAR(255),
    p_tipo_auth tipo_auth,
    p_nombre VARCHAR(255),
    p_apellido VARCHAR(255),
    p_telefono VARCHAR(30),
    p_activo BOOLEAN,

    p_ids_categorias INT[]     
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_nuevo_id_ubicacion INT;
    v_nuevo_id_persona INT;
    v_id_cat INT;
BEGIN
    INSERT INTO Ubicaciones (pais, provincia, ciudad, codigo, placeid)
    VALUES (p_pais, p_provincia, p_ciudad, p_codigo, p_placeid)
    RETURNING id_ubicacion INTO v_nuevo_id_ubicacion;

    INSERT INTO Personas (
        email, psw, tipo_auth, nombre, apellido, 
        telefono, id_ubicacion, activo
    )
    VALUES (
        p_email, p_psw, p_tipo_auth, p_nombre, p_apellido,
        p_telefono, v_nuevo_id_ubicacion, p_activo
    )
    RETURNING id_persona INTO v_nuevo_id_persona;
    FOREACH v_id_cat IN ARRAY p_ids_categorias
    LOOP
        INSERT INTO Personas_Categorias 
        VALUES (v_nuevo_id_persona, v_id_cat);
    END LOOP;
END;
$$;


--MODIFICAR
CREATE PROCEDURE spu_modificar_persona(
    p_id_persona INT,
    p_id_ubicacion INT,

    p_pais VARCHAR(60),
    p_provincia VARCHAR(60),
    p_ciudad VARCHAR(60),
    p_codigo VARCHAR(60),
    p_placeid TEXT,

    p_nombre VARCHAR(255),
    p_apellido VARCHAR(255),
    p_telefono VARCHAR(30),

    p_ids_categorias INT[] 
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_cat INT;
BEGIN
    UPDATE Ubicaciones 
    SET pais = p_pais, 
        provincia = p_provincia, 
        ciudad = p_ciudad, 
        codigo = p_codigo, 
        placeid = p_placeid
    WHERE id_ubicacion = p_id_ubicacion;

    UPDATE Personas 
    SET nombre = (p_nombre, nombre),
        apellido = (p_apellido, apellido),
        telefono = (p_telefono, telefono)
    WHERE id_persona = p_id_persona;

    DELETE FROM Personas_Categorias WHERE id_persona = p_id_persona;

    FOREACH v_id_cat IN ARRAY p_ids_categorias
    LOOP
        INSERT INTO Personas_Categorias 
        VALUES (p_id_persona, v_id_cat);
    END LOOP;
END;
$$;

--ESTADO CUENTA
CREATE PROCEDURE spu_cambiar_estado_cuenta(
    p_id_persona INT,
    p_activo BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Personas
    SET 
    activo = p_activo,
    fecha_baja = CASE 
        WHEN p_activo = FALSE THEN CURRENT_TIMESTAMP 
        ELSE NULL 
        END
    WHERE id_persona = p_id_persona;
END;
$$;