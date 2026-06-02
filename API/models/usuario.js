class Usuario
{
    constructor(id_persona,
    email,
    psw,
    tipo_auth,
    nombre,
    apellido,
    telefono,
    fecha_creacion)
    {
        this.id_persona = id_persona;
        this.email = email;
        this.psw = psw;
        this.tipo_auth = tipo_auth;
        this.nombre = nombre;
        this.apellido = apellido;
        this.telefono = telefono;
        this.fecha_creacion = Date.now();
    }
    
}

export default Usuario;