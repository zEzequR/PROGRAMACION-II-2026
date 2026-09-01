import { z } from 'zod';
import { generarUUID } from '../utils/generarUUID.js';
import { filePath } from '../config/uploadsPath.js'

class ArchivoDigital {
    static propiedades = z.object({
        idTienda: z.number().optional(),
        originalname: z.string().optional(),
        mimetype: z.string().optional(),
        path: z.string().optional(),
        size: z.number().optional(),
        key: z.string().optional()
    });

    constructor(file) {
        const datosValidados = ArchivoDigital.propiedades.parse(file);
        Object.assign(this, datosValidados);
        this.key = datosValidados.key || `tiendas/${this.idTienda}/${generarUUID()}.${this.extension}`;
    }

    get extension() {
        return this.originalname.split('.').pop();
    }
}

export { ArchivoDigital }