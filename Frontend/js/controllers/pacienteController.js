const Pacientes = require('../models/pacientes');

const obtenerPacientes = async (req, res) => {
  const dentistaId = req.params.dentistaId;

  try {
    const pacientes = await Pacientes.obtenerPacientesPorDentista(dentistaId);
    res.json(pacientes);
  } catch (error) {
    console.error('Error en obtenerPacientes:', error);
    res.status(500).json({ error: 'Error al obtener los pacientes' });
  }
};

module.exports = {
  obtenerPacientes,
};

