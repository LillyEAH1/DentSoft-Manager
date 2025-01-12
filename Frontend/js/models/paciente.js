const connectToDB = require('../db');

const obtenerPacientesPorDentista = async (dentistaId) => {
  const connection = await connectToDB();
  try {
    const result = await connection.execute(
      `SELECT p.ID_PACIENTE AS ID, p.NOMBRE AS Nombre
       FROM CONSULTORIO.PACIENTE p
       JOIN CONSULTORIO.DENTISTA_PACIENTE dp ON p.ID_PACIENTE = dp.ID_PACIENTE
       WHERE dp.NUMERO_DE_EMPLEADO = :dentistaId`,
      [dentistaId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error en obtenerPacientesPorDentista:', error);
    throw error;
  } finally {
    await connection.close();
  }
};

module.exports = {
  obtenerPacientesPorDentista,
};

