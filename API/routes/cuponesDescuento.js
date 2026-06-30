import { Router } from "express";

import * as cuponesControlador from '../controllers/codDescController.js';

const router = Router();

router.post('/crear', cuponesControlador.crearCodDesc);
router.put('/modificar', cuponesControlador.modificarCodDesc);
router.delete('/eliminar', cuponesControlador.eliminarCodDesc);

export default router;