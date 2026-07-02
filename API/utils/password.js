import bcrypt from 'bcrypt'

export async function hashPsw(psw)
{
    return bcrypt.hash(psw, 10);
}

export async function comparePsw(psw, dbPsw)
{
    return bcrypt.compare(psw, dbPsw);
}