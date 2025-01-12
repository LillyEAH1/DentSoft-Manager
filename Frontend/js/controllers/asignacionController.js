const Asignacion = require('../models/asignacion');

// Obtener datos para el formulario de asignación
const obtenerDatosAsignacion = async (req, res) => {
  try {
    const pacientes = await Asignacion.obtenerPacientesNoAsignados();
    const dentistas = await Asignacion.obtenerDentistas();
    const consultorios = await Asignacion.obtenerConsultorios();

    res.json({ pacientes, dentistas, consultorios });
  } catch (error) {
    console.error('Error en obtenerDatosAsignacion:', error);
    res.status(500).json({ error: 'Error al obtener los datos de asignación' });
  }
};

// Asignar paciente
const asignarPaciente = async (req, res) => {
  const { idPaciente, idDentista, idConsultorio } = req.body;

  try {
    await Asignacion.asignarPaciente(idPaciente, idDentista, idConsultorio);
    res.status(200).json({ message: 'Asignación exitosa' });
  } catch (error) {
    console.error('Error en asignarPaciente:', error);
    res.status(500).json({ error: 'Error al asignar paciente' });
  }
};

module.exports = {
  obtenerDatosAsignacion,
  asignarPaciente,
};
