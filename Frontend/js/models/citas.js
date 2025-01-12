const oracledb = require('oracledb');
const connectToDB = require('../connection'); // Archivo de conexión a la BD

async function obtenerCitas(dentista, pacienteId = null) {
  const sqlQuery = pacienteId
    ? `SELECT * FROM CONSULTORIO.CITA WHERE DENTISTA_CITA = :dentista AND ID_PACIENTE = :pacienteId`
    : `SELECT * FROM CONSULTORIO.CITA WHERE DENTISTA_CITA = :dentista`;

  const connection = await connectToDB();
  const result = await connection.execute(sqlQuery, { dentista, pacienteId });
  await connection.close();
  return result.rows;
}

module.exports = { obtenerCitas };