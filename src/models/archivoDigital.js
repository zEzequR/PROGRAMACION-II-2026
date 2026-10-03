import { z } from 'zod';
import { generarUUID } from '../utils/generarUUID.js';

class ArchivoDigital {
    static propiedades = z.object({
        idTienda: z.number().optional(),
        originalname: z.string().optional(),
        mimetype: z.string().optional(),
        path: z.string().optional(),
        size: z.number().optional(),
        type: z.string().optional(),
        key: z.string().optional()
    });

    constructor(file) {
        const datosValidados = ArchivoDigital.propiedades.parse(file);
        Object.assign(this, datosValidados);
        switch (this.type) 
        {
            case 'ARCHIVO':
                this.key = datosValidados.key || `tiendas/${this.idTienda}/productos/${generarUUID()}.${this.extension}`;
                break;
            case 'IMAGEN PRODUCTO':
                this.key = datosValidados.key || `tiendas/${this.idTienda}/img/${generarUUID()}.${this.extension}`;
                break;
        }
    }

    get extension() {
        return this.originalname.split('.').pop();
    }
}

export { ArchivoDigital }