import { Router } from "express";
import * as tarjetaControlador from '../controllers/tarjetaController.js'

const router = Router();

router.post('/agregar', tarjetaControlador.agregarTarjeta);
router.delete('/eliminar', tarjetaControlador.eliminarTarjeta);
router.get('/obtener', tarjetaControlador.obtenerTarjetas);

export default router;