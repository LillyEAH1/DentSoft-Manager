const { obtenerCitas } = require('../models/citas');

async function obtenerCitasController(req, res) {
  try {
    const { dentista, pacienteId } = req.query; // Parámetros enviados desde el frontend
    const citas = await obtenerCitas(dentista, pacienteId);
    res.status(200).json(citas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las citas.' });
  }
}

module.exports = { obtenerCitasController };