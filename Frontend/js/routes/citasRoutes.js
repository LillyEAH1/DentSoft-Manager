const express = require('express');
const { obtenerCitasController } = require('../controllers/citasController');

const router = express.Router();

router.get('/', obtenerCitasController); // Ruta para obtener citas

module.exports = router;