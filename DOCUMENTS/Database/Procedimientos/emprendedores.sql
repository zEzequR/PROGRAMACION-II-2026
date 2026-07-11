
--MODIFICAR

CREATE PROCEDURE spu_modificar_emprendedor(
    p_id_emprendedor INT,
    p_cuit VARCHAR(20) DEFAULT NULL,       
    p_mp_access_token TEXT DEFAULT NULL    
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Emprendedores
    SET 
        cuit = COALESCE(p_cuit, cuit),
        mp_access_token = COALESCE(p_mp_access_token, mp_access_token)
        
    WHERE id_emprendedor = p_id_emprendedor;
END;
$$;
