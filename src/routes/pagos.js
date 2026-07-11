import { Router } from "express";
import * as pagosControlador from '../controllers/pagosController.js';

const router = Router();

router.post('/crear', pagosControlador.crearPago);
router.put('/actualizar', pagosControlador.actualizarPago);
router.post('/preferencia', pagosControlador.crearPreferencia);
router.post('/webhook', pagosControlador.webhookMercadoPago); // MP también manda GET a veces, contemplalo si hace falta

export default router;