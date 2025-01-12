const express = require('express');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Inicialización del cliente Oracle
oracledb.initOracleClient({
  libDir: 'C:\\instantclient-basic-windows.x64-23.6.0.24.10\\instantclient_23_6',
});

const app = express();
const port = process.env.PORT || 4000;

// Configuración de CORS
app.use(
  cors({
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(bodyParser.json());

// Conexión a la base de datos
async function connectToDB() {
  try {
    const connection = await oracledb.getConnection({
      user: 'consultorio',
      password: 'dental1234',
      connectString: 'localhost:1521/XE',
    });
    console.log('Conexión a la base de datos exitosa');
    return connection;
  } catch (err) {
    console.error(
      'Error al conectar a la base de datos. Verifica las credenciales, conexión y configuración de Oracle:',
      err
    );
    throw err;
  }
}

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Rutas
const router = express.Router();

// Define las rutas
router.get('/contadores/pacientes-asignados', async (req, res) => {
  try {
    const connection = await connectToDB();
    const result = await connection.execute(
      `SELECT COUNT(*) AS total FROM PACIENTE WHERE NUMERO_DE_EMPLEADO = :numeroDeEmpleado`,
      [req.query.numeroDeEmpleado]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener el contador de pacientes asignados:', err);
    res.status(500).send('Error al obtener el contador de pacientes asignados');
  }
});

router.get('/contadores/citas-del-dia', async (req, res) => {
  try {
    const connection = await connectToDB();
    const result = await connection.execute(
      `SELECT COUNT(*) AS total FROM CITA WHERE FECHA_REGISTRO = TRUNC(SYSDATE) AND NUMERO_DE_EMPLEADO = :numeroDeEmpleado`,
      [req.query.numeroDeEmpleado]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener el contador de citas del día:', err);
    res.status(500).send('Error al obtener el contador de citas del día');
  }
});

router.get('/contadores/trabajos-del-mes', async (req, res) => {
  try {
    const connection = await connectToDB();
    const result = await connection.execute(
      `SELECT COUNT(*) AS total FROM TRABAJO_CITA WHERE EXTRACT(MONTH FROM FECHA) = EXTRACT(MONTH FROM SYSDATE) AND NUMERO_DE_EMPLEADO = :numeroDeEmpleado`,
      [req.query.numeroDeEmpleado]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener el contador de trabajos del mes:', err);
    res.status(500).send('Error al obtener el contador de trabajos del mes');
  }
});

router.get('/pacientes', async (req, res) => {
  try {
    const connection = await connectToDB();
    const result = await connection.execute(
      `SELECT * FROM PACIENTE WHERE NUMERO_DE_EMPLEADO = :numeroDeEmpleado`,
      [req.query.numeroDeEmpleado]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener los pacientes:', err);
    res.status(500).send('Error al obtener los pacientes');
  }
});

router.get('/costos', async (req, res) => {
  try {
    const connection = await connectToDB();
    const result = await connection.execute(`SELECT * FROM TIPO_DE_TRABAJO`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener los costos:', err);
    res.status(500).send('Error al obtener los costos');
  }
});

router.post('/citas', async (req, res) => {
  try {
    const { pacienteId, fecha, hora, tipoCita } = req.body;
    await agendarCita(pacienteId, fecha, hora, tipoCita);
    res.json({ message: 'Cita creada con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function agendarCita(pacienteId, fecha, hora, tipoCita) {
  try {
    const connection = await connectToDB();
    await connection.execute(
      `INSERT INTO CITA (ID_PACIENTE, FECHA_REGISTRO, HORA, TIPO_DE_CITA) VALUES (:pacienteId, :fecha, :hora, :tipoCita)`,
      [pacienteId, fecha, hora, tipoCita],
      { autoCommit: true }
    );
  } catch (err) {
    console.error('Error al agendar la cita:', err);
    throw err;
  }
}

// Ruta para obtener citas
router.get('/citas', async (req, res) => {
  try {
    const connection = await connectToDB();
    let query = `SELECT * FROM CITA WHERE DENTISTA_CITA = :dentistaId`;
    const params = [req.query.dentista];
    if (req.query.estado) {
      query += ` AND ESTADO_CITA = :estado`;
      params.push(req.query.estado);
    }
    const result = await connection.execute(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener citas:', err);
    res.status(500).send('Error al obtener citas');
  }
});

// Ruta para actualizar el estado de una cita
router.put('/citas/:id', async (req, res) => {
  try {
    const connection = await connectToDB();
    const { estado, fecha, hora } = req.body;
    const { id } = req.params;

    // Validar que fecha y hora no sean null
    if (!fecha || !hora) {
      return res.status(400).send('Fecha y hora son requeridos');
    }

    const result = await connection.execute(
      `UPDATE CITA SET ESTADO_CITA = :estado, FECHA_REGISTRO = TO_DATE(:fecha, 'YYYY-MM-DD'), HORA = TO_DATE(:hora, 'HH24:MI:SS') WHERE ID_CITA = :id`,
      [estado, fecha, hora, id],
      { autoCommit: true }
    );
    res.json({ message: 'Estado de la cita actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar el estado de la cita:', err);
    res.status(500).send('Error al actualizar el estado de la cita');
  }
});

// Ruta para obtener recordatorios
router.get('/recordatorios', async (req, res) => {
  try {
    const connection = await connectToDB();
    const result = await connection.execute(
      `SELECT * FROM RECORDATORIO WHERE DENTISTA_ID = :dentistaId`,
      [req.query.dentista]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener recordatorios:', err);
    res.status(500).send('Error al obtener recordatorios');
  }
});

// Ruta para enviar recordatorio
router.post('/recordatorios', async (req, res) => {
  try {
    const { dentistaId, pacienteId, mensaje } = req.body;
    const connection = await connectToDB();

    // Obtener el correo del paciente
    const result = await connection.execute(
      `SELECT EMAIL FROM PACIENTE WHERE ID_PACIENTE = :pacienteId`,
      [pacienteId]
    );
    const email = result.rows[0][0];

    // Enviar correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recordatorio de Cita',
      text: mensaje,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar correo:', error);
        return res.status(500).send('Error al enviar correo');
      }
      console.log('Correo enviado:', info.response);
      res.json({ message: 'Recordatorio enviado correctamente' });
    });

    // Guardar recordatorio en la base de datos
    await connection.execute(
      `INSERT INTO RECORDATORIO (DENTISTA_ID, PACIENTE_ID, MENSAJE, FECHA) VALUES (:dentistaId, :pacienteId, :mensaje, SYSDATE)`,
      [dentistaId, pacienteId, mensaje],
      { autoCommit: true }
    );
  } catch (err) {
    console.error('Error al enviar recordatorio:', err);
    res.status(500).send('Error al enviar recordatorio');
  }
});

// Ruta para obtener pacientes
router.get('/pacientes', async (req, res) => {
  try {
    const connection = await connectToDB();
    const result = await connection.execute(
      `SELECT * FROM PACIENTE WHERE NUMERO_DE_EMPLEADO = :numeroDeEmpleado`,
      [req.query.numeroDeEmpleado]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener los pacientes:', err);
    res.status(500).send('Error al obtener los pacientes');
  }
});

// Ruta para agregar paciente
router.post('/pacientes', async (req, res) => {
  try {
    const { id, nombre, dentistaId } = req.body;
    const connection = await connectToDB();
    await connection.execute(
      `INSERT INTO PACIENTE (ID_PACIENTE, NOMBRE, DENTISTA_ID) VALUES (:id, :nombre, :dentistaId)`,
      [id, nombre, dentistaId],
      { autoCommit: true }
    );
    res.json({ message: 'Paciente agregado correctamente' });
  } catch (err) {
    console.error('Error al agregar paciente:', err);
    res.status(500).send('Error al agregar paciente');
  }
});

// Ruta para actualizar paciente
router.put('/pacientes/:id', async (req, res) => {
  try {
    const { nombre } = req.body;
    const { id } = req.params;
    const connection = await connectToDB();
    await connection.execute(
      `UPDATE PACIENTE SET NOMBRE = :nombre WHERE ID_PACIENTE = :id`,
      [nombre, id],
      { autoCommit: true }
    );
    res.json({ message: 'Paciente actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar paciente:', err);
    res.status(500).send('Error al actualizar paciente');
  }
});

// Ruta para eliminar paciente
router.delete('/pacientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await connectToDB();
    await connection.execute(
      `DELETE FROM PACIENTE WHERE ID_PACIENTE = :id`,
      [id],
      { autoCommit: true }
    );
    res.json({ message: 'Paciente eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar paciente:', err);
    res.status(500).send('Error al eliminar paciente');
  }
});

// Ruta para obtener el historial clínico completo de un paciente
router.get('/historial/:pacienteId', async (req, res) => {
  try {
    const connection = await connectToDB();
    const { pacienteId } = req.params;
    const result = await connection.execute(
      `SELECT * FROM HISTORIAL_CLINICO WHERE PACIENTE_ID = :pacienteId ORDER BY FECHA DESC`,
      [pacienteId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener el historial clínico:', err);
    res.status(500).send('Error al obtener el historial clínico');
  }
});

// Ruta para obtener el historial clínico reciente de un paciente
router.get('/historial-reciente/:pacienteId', async (req, res) => {
  try {
    const connection = await connectToDB();
    const { pacienteId } = req.params;
    const result = await connection.execute(
      `SELECT * FROM (SELECT * FROM HISTORIAL_CLINICO WHERE PACIENTE_ID = :pacienteId ORDER BY FECHA DESC) WHERE ROWNUM <= 5`,
      [pacienteId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener el historial clínico reciente:', err);
    res.status(500).send('Error al obtener el historial clínico reciente');
  }
});

// Ruta para generar el ticket de costos
router.post('/ticket', async (req, res) => {
  try {
    const { pacienteId, items } = req.body;
    const connection = await connectToDB();

    // Guardar el ticket en la base de datos
    await connection.execute(
      `INSERT INTO TICKET (PACIENTE_ID, ITEMS, FECHA) VALUES (:pacienteId, :items, SYSDATE)`,
      [pacienteId, JSON.stringify(items)],
      { autoCommit: true }
    );

    res.json({ message: 'Ticket generado correctamente' });
  } catch (err) {
    console.error('Error al generar el ticket:', err);
    res.status(500).send('Error al generar el ticket');
  }
});

// Ruta para guardar la receta
router.post('/recetas', async (req, res) => {
  try {
    const { pacienteId, receta, firma } = req.body;
    const connection = await connectToDB();

    // Guardar la receta en la base de datos
    await connection.execute(
      `INSERT INTO RECETAS (PACIENTE_ID, RECETA, FIRMA, FECHA) VALUES (:pacienteId, :receta, :firma, SYSDATE)`,
      [pacienteId, receta, firma],
      { autoCommit: true }
    );

    res.json({ message: 'Receta guardada correctamente' });
  } catch (err) {
    console.error('Error al guardar la receta:', err);
    res.status(500).send('Error al guardar la receta');
  }
});

// Ruta para obtener el reporte por paciente
router.get('/reporte/paciente/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const connection = await connectToDB();
    const result = await connection.execute(
      `SELECT * FROM HISTORIAL_CLINICO WHERE PACIENTE_ID = :pacienteId ORDER BY FECHA DESC`,
      [pacienteId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener el reporte por paciente:', err);
    res.status(500).send('Error al obtener el reporte por paciente');
  }
});

// Ruta para obtener el reporte general
router.get('/reporte/general', async (req, res) => {
  try {
    const connection = await connectToDB();
    const result = await connection.execute(
      `SELECT * FROM HISTORIAL_CLINICO ORDER BY FECHA DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener el reporte general:', err);
    res.status(500).send('Error al obtener el reporte general');
  }
});

// Ruta para obtener el contador de pacientes asignados
router.get('/contadores/pacientes-asignados', async (req, res) => {
  try {
    const connection = await connectToDB();
    const result = await connection.execute(
      `SELECT COUNT(*) AS total FROM PACIENTE WHERE NUMERO_DE_EMPLEADO = :numeroDeEmpleado`,
      [req.query.numeroDeEmpleado]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener el contador de pacientes asignados:', err);
    res.status(500).send('Error al obtener el contador de pacientes asignados');
  }
});

// Ruta para obtener el contador de citas del día
router.get('/contadores/citas-del-dia', async (req, res) => {
  try {
    const connection = await connectToDB();
    const result = await connection.execute(
      `SELECT COUNT(*) AS total FROM CITA WHERE FECHA_REGISTRO = TRUNC(SYSDATE) AND NUMERO_DE_EMPLEADO = :numeroDeEmpleado`,
      [req.query.numeroDeEmpleado]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener el contador de citas del día:', err);
    res.status(500).send('Error al obtener el contador de citas del día');
  }
});

// Ruta para obtener el contador de procedimientos del mes
router.get('/contadores/procedimientos-del-mes', async (req, res) => {
  try {
    const connection = await connectToDB();
    const result = await connection.execute(
      `SELECT COUNT(*) AS total FROM PROCEDIMIENTOS WHERE EXTRACT(MONTH FROM FECHA) = EXTRACT(MONTH FROM SYSDATE) AND NUMERO_DE_EMPLEADO = :numeroDeEmpleado`,
      [req.query.numeroDeEmpleado]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener el contador de procedimientos del mes:', err);
    res.status(500).send('Error al obtener el contador de procedimientos del mes');
  }
});

// Ruta para obtener el contador de trabajos del mes
router.get('/contadores/trabajos-del-mes', async (req, res) => {
  try {
    const connection = await connectToDB();
    const result = await connection.execute(
      `SELECT COUNT(*) AS total FROM TRABAJO_CITA WHERE EXTRACT(MONTH FROM FECHA) = EXTRACT(MONTH FROM SYSDATE) AND NUMERO_DE_EMPLEADO = :numeroDeEmpleado`,
      [req.query.numeroDeEmpleado]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener el contador de trabajos del mes:', err);
    res.status(500).send('Error al obtener el contador de trabajos del mes');
  }
});

// Usa el router
app.use('/api', router);

// Inicia el servidor
async function startServer() {
  try {
    await connectToDB(); // Valida conexión antes de iniciar el servidor
    app.listen(4000, () => {
      console.log(`Servidor corriendo en http://localhost:${4000}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `El puerto ${port} ya está en uso. Intenta usar otro puerto.`
        );
      } else {
        console.error('Error inesperado en el servidor:', err);
      }
    });
  } catch (err) {
    console.error(
      'Error al intentar iniciar el servidor. Verifica la conexión a la base de datos:',
      err
    );
  }
}

startServer();

// Rutas para citas
router.get('/', async (req, res) => {
  try {
    const { dentista, pacienteId } = req.query;
    const citas = await obtenerCitas(dentista, pacienteId);
    res.json(citas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { accion, nuevaFecha } = req.body;
    const { id } = req.params;
    await actualizarCita(id, accion, nuevaFecha);
    res.json({ message: 'Cita actualizada con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { pacienteId, fecha, hora, tipoCita } = req.body;
    await agendarCita(pacienteId, fecha, hora, tipoCita);
    res.json({ message: 'Cita creada con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// Usa el router
app.use('/api', router);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

// Ruta para enviar recordatorio
router.post('/recordatorios', async (req, res) => {
  try {
    const { pacienteId, mensaje } = req.body;
    const connection = await connectToDB();
    await connection.execute(
      `INSERT INTO RECORDATORIOS (ID_PACIENTE, MENSAJE, FECHA) VALUES (:pacienteId, :mensaje, SYSDATE)`,
      [pacienteId, mensaje],
      { autoCommit: true }
    );
    res.json({ message: 'Recordatorio enviado correctamente' });
  } catch (err) {
    console.error('Error al enviar el recordatorio:', err);
    res.status(500).send('Error al enviar el recordatorio');
  }
});

// Ruta para obtener el reporte de un paciente
router.get('/reporte/paciente/:id', async (req, res) => {
  try {
    const connection = await connectToDB();
    const pacienteId = req.params.id;

    // Obtener información básica del paciente
    const pacienteResult = await connection.execute(
      `SELECT * FROM PACIENTE WHERE ID_PACIENTE = :pacienteId`,
      [pacienteId]
    );

    // Obtener citas del paciente
    const citasResult = await connection.execute(
      `SELECT * FROM CITA WHERE ID_PACIENTE = :pacienteId`,
      [pacienteId]
    );

    // Obtener diagnósticos del paciente
    const diagnosticosResult = await connection.execute(
      `SELECT * FROM DIAGNOSTICO WHERE ID_CITA IN (SELECT ID_CITA FROM CITA WHERE ID_PACIENTE = :pacienteId)`,
      [pacienteId]
    );

    // Obtener historial de medicamentos del paciente
    const medicamentosResult = await connection.execute(
      `SELECT * FROM HISTORIAL_DE_MEDICAMENTO WHERE ID_DIAGNOSTICO IN (SELECT ID_DIAGNOSTICO FROM DIAGNOSTICO WHERE ID_CITA IN (SELECT ID_CITA FROM CITA WHERE ID_PACIENTE = :pacienteId))`,
      [pacienteId]
    );

    // Obtener residencia del paciente
    const residenciaResult = await connection.execute(
      `SELECT * FROM RESIDENCIA WHERE ID_PACIENTE = :pacienteId`,
      [pacienteId]
    );

    // Obtener contacto de emergencia del paciente
    const contactoResult = await connection.execute(
      `SELECT * FROM CONTACTO_DE_EMERGENCIA WHERE ID_CONTANCTO = (SELECT ID_CONTANCTO FROM PACIENTE WHERE ID_PACIENTE = :pacienteId)`,
      [pacienteId]
    );

    res.json({
      paciente: pacienteResult.rows[0],
      citas: citasResult.rows,
      diagnosticos: diagnosticosResult.rows,
      medicamentos: medicamentosResult.rows,
      residencia: residenciaResult.rows[0],
      contacto: contactoResult.rows[0]
    });
  } catch (err) {
    console.error('Error al obtener el reporte del paciente:', err);
    res.status(500).send('Error al obtener el reporte del paciente');
  }
});

