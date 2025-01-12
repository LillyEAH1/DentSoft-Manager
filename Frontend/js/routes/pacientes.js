const express = require('express');
const router = express.Router();
const pacientesController = require('../controllers/pacientesController');

// Ruta para obtener los pacientes del dentista
router.get('/:dentistaId', pacientesController.obtenerPacientes);

module.exports = router;
