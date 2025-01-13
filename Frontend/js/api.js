const express = require('express');
const oracledb = require('oracledb');
const router = express.Router();

router.get('/pacientes', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute('SELECT * FROM paciente');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving patients');
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

router.delete('/pacientes/:id', async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();
    await connection.execute('DELETE FROM paciente WHERE ID_PACIENTE = :id', [id], { autoCommit: true });
    res.status(200).send('Patient deleted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting patient');
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
});

module.exports = router;
