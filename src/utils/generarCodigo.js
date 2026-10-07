import crypto from 'node:crypto';
import 'dotenv/config';


export function generarCodigo(user) {
    const data = `${user.email}:${Math.floor(Date.now() / (60 * 5000))}`;

    const hmac = crypto.createHmac('sha256', process.env.CRYPTO_SECRET)
                        .update(data)
                        .digest();

    for (let i = 0; i < hmac.length; i++) {
        console.log(`HMAC, BYTE ${i}: ${hmac[i]}`);
    }

    const num = hmac.readUInt32BE(0);

    console.log(`PRIMEROS 4B ${num}`);

    console.log(`PRIMEROS 6 DÍGITOS ${String(num % 1000000).padStart(6, '0')}`);

    return String(num % 1000000).padStart(6, '0');
}


export function verifyResetCode(user, inputCode) {

    try
    {
        const expectedCode = generarCodigo(user);
        
        return crypto.timingSafeEqual(
            Buffer.from(inputCode),
            Buffer.from(expectedCode)
        );
    }
    catch(err)
    {
        return false;
    }
}