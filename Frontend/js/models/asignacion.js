const connectToDB = require('../db');

// Obtener pacientes no asignados
const obtenerPacientesNoAsignados = async () => {
  const connection = await connectToDB();
  try {
    const result = await connection.execute(
      `SELECT ID_PACIENTE AS ID, NOMBRE FROM CONSULTORIO.PACIENTE
       WHERE ID_PACIENTE NOT IN (
         SELECT ID_PACIENTE FROM CONSULTORIO.DENTISTA_PACIENTE
       )`
    );
    return result.rows;
  } catch (error) {
    console.error('Error en obtenerPacientesNoAsignados:', error);
    throw error;
  } finally {
    await connection.close();
  }
};

// Obtener todos los dentistas
const obtenerDentistas = async () => {
  const connection = await connectToDB();
  try {
    const result = await connection.execute(
      `SELECT NUMERO_DE_EMPLEADO AS ID, NOMBRE FROM CONSULTORIO.DENTISTA`
    );
    return result.rows;
  } catch (error) {
    console.error('Error en obtenerDentistas:', error);
    throw error;
  } finally {
    await connection.close();
  }
};

// Obtener todos los consultorios
const obtenerConsultorios = async () => {
  const connection = await connectToDB();
  try {
    const result = await connection.execute(
      `SELECT ID_CONSULTORIO AS ID, NOMBRE_CONSULTORIO AS NOMBRE FROM CONSULTORIO.CONSULTORIO`
    );
    return result.rows;
  } catch (error) {
    console.error('Error en obtenerConsultorios:', error);
    throw error;
  } finally {
    await connection.close();
  }
};

// Asignar paciente a un dentista y consultorio
const asignarPaciente = async (idPaciente, idDentista, idConsultorio) => {
  const connection = await connectToDB();
  try {
    await connection.execute(
      `INSERT INTO CONSULTORIO.DENTISTA_PACIENTE (ID_PACIENTE, NUMERO_DE_EMPLEADO, ID_CONSULTORIO)
       VALUES (:idPaciente, :idDentista, :idConsultorio)`,
      [idPaciente, idDentista, idConsultorio],
      { autoCommit: true }
    );
  } catch (error) {
    console.error('Error en asignarPaciente:', error);
    throw error;
  } finally {
    await connection.close();
  }
};

module.exports = {
  obtenerPacientesNoAsignados,
  obtenerDentistas,
  obtenerConsultorios,
  asignarPaciente,
};
