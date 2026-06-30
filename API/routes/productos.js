import { Router } from "express";

import * as productoControlador from '../controllers/productoController.js';

const router = Router();

router.post('/crear', productoControlador.crearProd);
router.put('/modificar', productoControlador.modificarProd);
router.delete('/eliminar', productoControlador.eliminarProd);
router.get('/obtener', productoControlador.obtenerProductos);


export default router;