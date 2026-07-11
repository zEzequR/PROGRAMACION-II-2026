--crear
CREATE PROCEDURE spu_crear_cliente(
    p_id_cliente INT,
    p_id_persona INT,
    p_id_tienda INT,
    p_suscripcion BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO Clientes (
        id_cliente, 
        id_persona, 
        id_tienda, 
        suscripcion
    )
    VALUES (
        p_id_cliente, 
        p_id_persona, 
        p_id_tienda, 
        p_suscripcion
    );
END;
$$;

--modificar

CREATE PROCEDURE spu_modificar_cliente(
    p_id_cliente INT,
    p_suscripcion BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Clientes 
    SET suscripcion = COALESCE(p_suscripcion,suscripcion) 
    WHERE id_cliente = p_id_cliente;
END;
$$;