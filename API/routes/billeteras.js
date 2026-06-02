import { Router } from "express";
import * as billeteraControlador from '../controllers/billeteraController.js'

const router = Router();

router.post('/agregar', billeteraControlador.agregarFuenteIngreso);

export default router;