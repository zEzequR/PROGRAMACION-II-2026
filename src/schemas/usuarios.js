import { z } from 'zod';

export const soloIdPersona = z.object({
    user: z.object({
        idPersona: z.number()
    })
});

export const loginManual = z.object({
    credenciales: z.object({
        email: z.email().max(255),
        psw: z.string().min(1).max(72)
    })
});

export const loginGoogle = z.object({
    google: z.object({
        email: z.email().max(255),
        nombre: z.string().trim().min(1).max(255),
        apellido: z.string().trim().max(255).default('')
    })
});

const bodyRegistroManual = z.object({
    email: z.email().max(255),
    psw: z.string().min(6).max(72),
    tipoAuth: z.literal('MANUAL').default('MANUAL'),
    nombre: z.string().trim().min(1).max(255),
    apellido: z.string().trim().min(1).max(255),
    telefono: z.string().trim().min(1).max(30),
    direccion: z.string().trim().min(1).max(255),
    piso: z.string().trim().max(10).optional(),
    depto: z.string().trim().max(10).optional(),
    pais: z.string().trim().min(1).max(60),
    provincia: z.string().trim().min(1).max(60),
    ciudad: z.string().trim().min(1).max(60),
    codigo: z.string().trim().max(60).optional(),
    categoriasInteres: z.array(z.number().int().positive()).min(1).max(4).refine(function (lista)
    {
        return new Set(lista).size === lista.length;
    })
});

const bodyRegistroGoogle = z.object({
    tipoAuth: z.literal('GOOGLE').default('GOOGLE'),
    telefono: z.string().trim().min(1).max(30),
    direccion: z.string().trim().min(1).max(255),
    piso: z.string().trim().max(10).optional(),
    depto: z.string().trim().max(10).optional(),
    pais: z.string().trim().min(1).max(60),
    provincia: z.string().trim().min(1).max(60),
    ciudad: z.string().trim().min(1).max(60),
    codigo: z.string().trim().max(60).optional(),
    categoriasInteres: z.array(z.number().int().positive()).min(1).max(4).refine(function (lista)
    {
        return new Set(lista).size === lista.length;
    })
});

const bodyModificarUsuario = z.object({
    nombre: z.string().trim().min(1).max(255).optional(),
    apellido: z.string().trim().min(1).max(255).optional(),
    telefono: z.string().trim().min(1).max(30).optional(),
    direccion: z.string().trim().min(1).max(255).optional(),
    piso: z.string().trim().max(10).optional(),
    depto: z.string().trim().max(10).optional(),
    pais: z.string().trim().min(1).max(60).optional(),
    provincia: z.string().trim().min(1).max(60).optional(),
    ciudad: z.string().trim().min(1).max(60).optional(),
    codigo: z.string().trim().max(60).optional(),
    categoriasInteres: z.array(z.number().int().positive()).min(1).max(4).refine(function (lista)
    {
        return new Set(lista).size === lista.length;
    }).optional()
});

const bodyRecuperarPsw = z.object({
    email: z.email().max(255),
    codigo: z.string().regex(/^\d{6}$/),
    psw: z.string().min(6).max(72)
});

export const registroManual = z.object({
    body: bodyRegistroManual
});

export const registroGoogle = loginGoogle.extend({
    body: bodyRegistroGoogle
});

export const modificarUsuario = soloIdPersona.extend({
    body: bodyModificarUsuario
});

export const recuperarPsw = z.object({
    body: bodyRecuperarPsw
});
