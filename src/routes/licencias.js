import { Router } from 'express';
import * as licenciaControlador from '../controllers/licenciaController.js';
import { validateSchemas } from '../middlewares/validators.js';
import * as licenciaSchemas from '../schemas/licencias.js';
import { licenciaVenta } from '../models/licenciaVenta.js';
import { Usuario } from '../models/usuario.js';

const router = Router();

router.post('/validar', validateSchemas(licenciaSchemas.validarLicencia, [licenciaVenta, Usuario]),
licenciaControlador.validarLicencia);

export default router;
