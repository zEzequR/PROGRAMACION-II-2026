class Usuario
{
    constructor(idPersona,
    email,
    psw,
    tipo_auth,
    nombre,
    apellido,
    telefono,
    activo,
    fecha_creacion)
    {
        this.idPersona = idPersona;
        this.email = email;
        this.psw = psw;
        this.tipo_auth = tipo_auth;
        this.nombre = nombre;
        this.apellido = apellido;
        this.telefono = telefono;
        this.activo = true;
    }
}

class Emprendedor extends Usuario
{
    constructor(
        idPersona,
        idEmprendedor,
        email,
        psw,
        tipo_auth,
        nombre, 
        apellido, 
        telefono, 
        cuit, 
        mpAccessToken)
    {
        super(
            idPersona,
            email,
            psw,
            tipo_auth, 
            nombre, 
            apellido, 
            telefono);
        
        this.idEmprendedor = idEmprendedor
        this.cuit = cuit;
        this.mpAccessToken = mpAccessToken;
    }
}

class Cliente extends Usuario {
    constructor(
        idPersona,
        idCliente, 
        email, 
        psw, 
        tipo_auth, 
        nombre, 
        apellido, 
        telefono, 
        id_tienda, 
        suscripcion)
    {
        
        super(
            idPersona, 
            email, 
            psw, 
            tipo_auth, 
            nombre, 
            apellido, 
            telefono);
        this.idCliente = idCliente;
        this.id_tienda = id_tienda;
        this.suscripcion = suscripcion;
    }
}

export { Usuario, Emprendedor, Cliente };