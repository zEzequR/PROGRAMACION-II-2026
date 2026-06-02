import { Router } from "express";
import * as emprendedorControlador from '../controllers/emprendedorController.js'

const router = Router();

router.post('/crear', emprendedorControlador.crearEmprendedor);

export default router;