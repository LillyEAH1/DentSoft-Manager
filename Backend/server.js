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
app.use(express.json());


app.use(bodyParser.json());

// Conexión a la base de datos
async function connectToDB() {
  try {
    console.log('Intentando conectar a la base de datos...');
    const connection = await oracledb.getConnection({
      user: 'consultorio',
      password: 'dental1234',
      connectString: 'localhost:1521/XE',
    });
    console.log('Conexión a la base de datos exitosa');
    return connection;
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
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

// Inicializa el router
const router = express.Router();
app.use('/api', router); 
app.post('/initialize', async (req, res) => {
  try {
    const connection = await connectToDB();

    // Insertar datos del dentista
    await connection.execute(
      `INSERT INTO DENTISTA (NUMERO_DE_EMPLEADO, NOMBRE, APELLIDO_PA, APELLIDO_MA, ID_ESPECIALIDAD)
       VALUES (1001, 'Carlos', 'Gómez', 'Pérez', 1)`,
      [],
      { autoCommit: true }
    );

    // Insertar datos de pacientes
    await connection.execute(
      `INSERT INTO PACIENTE (ID_PACIENTE, NOMBRE, APELLIDO_PA, APELLIDO_MA, NUMERO_DE_EMPLEADO)
       VALUES (1, 'Juan', 'Pérez', 'López', 1001)`,
      [],
      { autoCommit: true }
    );

    await connection.execute(
      `INSERT INTO PACIENTE (ID_PACIENTE, NOMBRE, APELLIDO_PA, APELLIDO_MA, NUMERO_DE_EMPLEADO)
       VALUES (2, 'Ana', 'Martínez', 'Ruiz', 1001)`,
      [],
      { autoCommit: true }
    );

    // Insertar datos de citas
    await connection.execute(
      `INSERT INTO CITA (ID_CITA, FECHA_REGISTRO, ESTADO_CITA, HORA, DENTISTA_CITA, ID_PACIENTE, ID_CONSULTORIO, TIPO_DE_CITA, NUMERO_DE_EMPLEADO)
       VALUES (1, TO_DATE('2023-11-01', 'YYYY-MM-DD'), 'A', '10:00', 1001, 1, 1, 'Chequeo', 1001)`,
      [],
      { autoCommit: true }
    );

    res.send('Datos inicializados correctamente.');
  } catch (err) {
    console.error('Error al inicializar los datos:', err);
    res.status(500).send('Error al inicializar los datos.');
  }
});

app.listen(4000, () => {
  console.log('Servidor corriendo en http://localhost:4000');
});

// Define las rutas

// Ruta para registrar un nuevo paciente y asignar dentista y consultorio

router.get('/api/dentista/:dentistaId', async (req, res) => {
  try {
    const { dentistaId } = req.params; // ID del dentista enviado desde el frontend
    const connection = await connectToDB();

    // Obtener pacientes asociados al dentista
    const pacientes = await connection.execute(
      `SELECT * FROM PACIENTE WHERE ID_CONTANCTO = :dentistaId`,
      [dentistaId]
    );

    // Obtener citas asociadas al dentista
    const citas = await connection.execute(
      `SELECT * FROM CITA WHERE NUMERO_DE_EMPLEADO = :dentistaId`,
      [dentistaId]
    );

    res.json({
      pacientes: pacientes.rows,
      citas: citas.rows,
    });
  } catch (err) {
    console.error('Error al cargar datos del dentista:', err);
    res.status(500).send('Error al cargar datos del dentista');
  }
});


router.post('/registrarPaciente', async (req, res) => {
  const { idPaciente, nombre, apellidoPa, apellidoMa, fechaNac, numeroTel, correo } = req.body;

  // Validación de datos
  if (!idPaciente || !nombre || !apellidoPa || !fechaNac || !numeroTel || !correo) {
    return res.status(400).json({ message: 'Todos los campos obligatorios deben estar presentes.' });
  }

  try {
    const connection = await connectToDB();

    // Inserción del paciente
    await connection.execute(
      `INSERT INTO PACIENTE (ID_PACIENTE, NOMBRE, APELLIDO_PA, APELLIDO_MA, FECHA_NAC, NUMERO_TEL, CORREO)
       VALUES (:idPaciente, :nombre, :apellidoPa, :apellidoMa, TO_DATE(:fechaNac, 'YYYY-MM-DD'), :numeroTel, :correo)`,
      {
        idPaciente,
        nombre,
        apellidoPa,
        apellidoMa: apellidoMa || null, // Campo opcional
        fechaNac,
        numeroTel,
        correo,
      },
      { autoCommit: true }
    );

    res.json({ message: 'Paciente registrado con éxito.' });
  } catch (err) {
    console.error('Error al registrar paciente:', err);
    res.status(500).json({ message: 'Error en el servidor al registrar paciente.', error: err.message });
  }
});

// Ruta para buscar pacientes y dentistas
router.post('/buscar', async (req, res) => {
  console.log('Solicitud POST recibida en /buscar:', req.body);
  const { busqueda } = req.body;

  if (!busqueda) {
    return res.status(400).json({ message: 'El parámetro de búsqueda es obligatorio.' });
  }

  // Consultas SQL para buscar en PACIENTE y DENTISTA
  const queryPacientes = `
    SELECT 
      'PACIENTE' AS tipo, 
      ID_PACIENTE AS id, 
      NOMBRE AS nombre 
    FROM PACIENTE 
    WHERE ID_PACIENTE = :busquedaNumero OR LOWER(NOMBRE) LIKE LOWER(:busquedaTexto)`;

  const queryDentistas = `
    SELECT 
      'DENTISTA' AS tipo, 
      NUMERO_DE_EMPLEADO AS id, 
      NOMBRE AS nombre 
    FROM DENTISTA 
    WHERE NUMERO_DE_EMPLEADO = :busquedaNumero OR LOWER(NOMBRE) LIKE LOWER(:busquedaTexto)`;

  try {
    const connection = await connectToDB();

    // Ejecutar las consultas con UNION
    const results = await connection.execute(
      `${queryPacientes} UNION ${queryDentistas}`,
      {
        busquedaNumero: isNaN(busqueda) ? null : parseInt(busqueda), // Convierte la búsqueda a número si aplica
        busquedaTexto: `%${busqueda}%`,
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (results.rows.length > 0) {
      res.json(results.rows);
    } else {
      res.json({ message: 'No se encontraron resultados.' });
    }
  } catch (err) {
    console.error('Error al ejecutar la consulta:', err);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

//Contador de pacientes 
router.get('/contadores/pacientes-asignados', async (req, res) => {
  const { numeroDeEmpleado } = req.query;

  if (!numeroDeEmpleado || isNaN(numeroDeEmpleado)) {
    return res.status(400).json({ message: 'El parámetro "numeroDeEmpleado" es obligatorio y debe ser un número.' });
  }

  try {
    const connection = await connectToDB();
    const result = await connection.execute(
      `SELECT COUNT(*) AS total 
       FROM CITA 
       WHERE NUMERO_DE_EMPLEADO = :numeroDeEmpleado`,
      [parseInt(numeroDeEmpleado)],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length > 0) {
      res.json({ total: result.rows[0].TOTAL });
    } else {
      res.json({ total: 0 });
    }
  } catch (err) {
    console.error('Error al obtener el contador de pacientes asignados:', err);
    res.status(500).json({ message: 'Error al obtener el contador de pacientes asignados.' });
  }
});


//Crear citas
router.post('/citas', async (req, res) => {
  try {
    const { pacienteId, fecha, hora, tipoCita, estadoCita = 'P', idConsultorio } = req.body;

    // Validación básica
    if (!pacienteId || !fecha || !hora || !tipoCita || !idConsultorio) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const connection = await connectToDB();

    // Obtener el próximo ID_CITA
    const idCitaResult = await connection.execute(
      `SELECT NVL(MAX(ID_CITA), 0) + 1 AS nuevoId FROM CITA`
    );

    if (!idCitaResult.rows || !idCitaResult.rows[0]) {
      return res.status(500).json({ message: 'Error al generar un nuevo ID_CITA.' });
    }

    const nuevoIdCita = idCitaResult.rows[0].NUEVOID;

    // Verificar existencia del paciente
    const pacienteCheck = await connection.execute(
      `SELECT COUNT(*) AS total FROM PACIENTE WHERE ID_PACIENTE = :pacienteId`,
      [pacienteId]
    );

    if (pacienteCheck.rows[0]?.TOTAL === 0) {
      return res.status(404).json({ message: 'El paciente no existe.' });
    }

    // Verificar conflictos de horario
    const conflictCheck = await connection.execute(
      `SELECT COUNT(*) AS total 
       FROM CITA 
       WHERE NUMERO_DE_EMPLEADO = 1001 
       AND FECHA_REGISTRO = TO_DATE(:fecha, 'YYYY-MM-DD') 
       AND HORA = TO_DATE(:hora, 'HH24:MI:SS')`,
      { fecha, hora }
    );

    if (conflictCheck.rows[0]?.TOTAL > 0) {
      return res.status(409).json({ message: 'El dentista ya tiene una cita programada para esta fecha y hora.' });
    }

    // Insertar la cita
    await connection.execute(
      `INSERT INTO CITA (
        ID_CITA, 
        ID_PACIENTE, 
        FECHA_REGISTRO, 
        HORA, 
        TIPO_DE_CITA, 
        NUMERO_DE_EMPLEADO,
        ESTADO_CITA, 
        ID_CONSULTORIO
      ) VALUES (
        :idCita, 
        :pacienteId, 
        TO_DATE(:fecha, 'YYYY-MM-DD'), 
        TO_DATE(:hora, 'HH24:MI:SS'), 
        :tipoCita, 
        1001, 
        :estadoCita, 
        :idConsultorio
      )`,
      {
        idCita: nuevoIdCita,
        pacienteId,
        fecha,
        hora,
        tipoCita,
        estadoCita,
        idConsultorio
      },
      { autoCommit: true }
    );

    res.json({ message: 'Cita creada con éxito', idCita: nuevoIdCita });
  } catch (err) {
    console.error('Error al crear la cita:', err);
    res.status(500).json({ message: 'Error al crear la cita.', error: err.message });
  }
});


//Crear receta
router.get('/recetas', async (req, res) => {
  try {
    const { pacienteId } = req.query;

    if (!pacienteId) {
      return res.status(400).json({ message: 'El parámetro pacienteId es obligatorio.' });
    }

    const connection = await connectToDB();

    const result = await connection.execute(
      `SELECT
          P.NOMBRE AS nombre_paciente,
          P.APELLIDO_PA AS apellido_paterno,
          P.APELLIDO_MA AS apellido_materno,
          C.FECHA_REGISTRO AS fecha_cita,
          C.HORA AS hora_cita,
          C.TIPO_DE_CITA AS tipo_cita,
          D.DESCRIPCION_DE_TRATAMIENTO AS descripcion_tratamiento,
          M.NOMBRE_MEDICAMENTO AS medicamento,
          M.DOSIS AS dosis,
          M.FRECUENCIA AS frecuencia
      FROM PACIENTE P
      JOIN CITA C ON P.ID_PACIENTE = C.ID_PACIENTE
      JOIN DIAGNOSTICO D ON C.ID_CITA = D.ID_CITA
      LEFT JOIN HISTORIAL_DE_MEDICAMENTO M ON D.ID_DIAGNOSTICO = M.ID_DIAGNOSTICO
      WHERE P.ID_PACIENTE = :pacienteId`,
      { pacienteId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener recetas:', err);
    res.status(500).send('Error al obtener recetas');
  }
});

//Tabla de costos
router.get('/costos', async (req, res) => {
  try {
    const connection = await connectToDB();
    const result = await connection.execute(
      `SELECT 
         ID_TIPO_DE_TRABAJO AS id_trabajo, 
         NOMBRE_TRABAJO AS nombre, 
         COSTO 
       FROM TIPO_DE_TRABAJO`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener costos:', err);
    res.status(500).send('Error al obtener costos');
  }
});


//Contador citas del dia
router.get('/contadores/citas-del-dia', async (req, res) => {
  const { numeroDeEmpleado } = req.query;

  if (!numeroDeEmpleado || isNaN(numeroDeEmpleado)) {
    return res
      .status(400)
      .json({ message: "El parámetro 'numeroDeEmpleado' es obligatorio y debe ser un número." });
  }

  try {
    const connection = await connectToDB();
    const result = await connection.execute(
      `SELECT COUNT(*) AS total 
       FROM CITA 
       WHERE FECHA_REGISTRO = TRUNC(SYSDATE) 
       AND NUMERO_DE_EMPLEADO = :numeroDeEmpleado`,
      [parseInt(numeroDeEmpleado)],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows[0] || { TOTAL: 0 });
  } catch (err) {
    console.error('Error al obtener el contador de citas del día:', err);
    res.status(500).json({ message: 'Error al obtener el contador de citas del día' });
  }
});

//Contador de trabajos del mes
router.get('/contadores/trabajos-del-mes', async (req, res) => {
  const { numeroDeEmpleado } = req.query;

  if (!numeroDeEmpleado || isNaN(numeroDeEmpleado)) {
    return res
      .status(400)
      .json({ message: "El parámetro 'numeroDeEmpleado' es obligatorio y debe ser un número." });
  }

  try {
    const connection = await connectToDB();
    const result = await connection.execute(
      `SELECT COUNT(*) AS total 
       FROM TRABAJO_CITA TC
       JOIN CITA C ON TC.ID_CITA = C.ID_CITA
       WHERE EXTRACT(MONTH FROM C.FECHA_REGISTRO) = EXTRACT(MONTH FROM SYSDATE)
       AND C.NUMERO_DE_EMPLEADO = :numeroDeEmpleado`,
      [parseInt(numeroDeEmpleado)],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows[0] || { TOTAL: 0 });
  } catch (err) {
    console.error('Error al obtener el contador de trabajos del mes:', err);
    res.status(500).json({ message: 'Error al obtener el contador de trabajos del mes.' });
  }
});

//Obtener la lista de pacientes asignados a un dentista específico
router.get('/pacientes', async (req, res) => {
  try {
    let { numeroDeEmpleado } = req.query;

    if (!numeroDeEmpleado) {
      return res.status(400).send('El número de empleado es requerido');
    }

    // Limpia el parámetro eliminando saltos de línea y espacios
    numeroDeEmpleado = numeroDeEmpleado.trim();

    console.log('Número de empleado recibido (limpio):', numeroDeEmpleado);

    const connection = await connectToDB();
    const result = await connection.execute(
      `SELECT P.ID_PACIENTE, P.NOMBRE, P.APELLIDO_PA, P.APELLIDO_MA
       FROM PACIENTE P
       JOIN CITA C ON P.ID_PACIENTE = C.ID_PACIENTE
       WHERE C.NUMERO_DE_EMPLEADO = :numeroDeEmpleado`,
      [numeroDeEmpleado]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('No se encontraron pacientes para este dentista');
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error en la ruta /pacientes:', err);
    res.status(500).send('Error en el servidor');
  }
});


//Generar ticket
router.get('/costos', async (req, res) => {
  try {
    const connection = await connectToDB();
    const result = await connection.execute(
      `SELECT ID_TIPO_DE_TRABAJO, NOMBRE_TRABAJO, COSTO FROM TIPO_DE_TRABAJO`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener los costos:', err);
    res.status(500).send('Error al obtener los costos');
  }
});


//Consultar las citas en la base de datos
router.get('/citas', async (req, res) => {
  try {
    const connection = await connectToDB();
    let query = `SELECT * FROM CITA WHERE 1=1`;
    const params = [];

    if (req.query.dentista) {
      query += ` AND NUMERO_DE_EMPLEADO = :dentistaId`;
      params.push(req.query.dentista);
    }

    if (req.query.pacienteId) {
      query += ` AND ID_PACIENTE = :pacienteId`;
      params.push(req.query.pacienteId);
    }

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

// Ruta para obtener todos los pacientes asignados a un dentista
router.get('/pacientes', async (req, res) => {
  try {
    const { numeroDeEmpleado } = req.query;

    // Validación de parámetros
    if (!numeroDeEmpleado) {
      return res.status(400).json({ message: 'El número de empleado es requerido.' });
    }

    // Conexión a la base de datos
    const connection = await connectToDB();

    // Consulta SQL para obtener pacientes asignados al dentista
    const query = `
      SELECT 
        P.ID_PACIENTE AS idPaciente, 
        P.NOMBRE AS nombre, 
        P.APELLIDO_PA AS apellidoPaterno, 
        P.APELLIDO_MA AS apellidoMaterno
      FROM PACIENTE P
      JOIN CITA C ON P.ID_PACIENTE = C.ID_PACIENTE
      WHERE C.NUMERO_DE_EMPLEADO = :numeroDeEmpleado
    `;

    // Ejecución de la consulta
    const result = await connection.execute(
      query,
      [numeroDeEmpleado],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Validar si no se encontraron pacientes
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron pacientes para este dentista.' });
    }

    // Respuesta con los pacientes encontrados
    res.json(result.rows);
  } catch (err) {
    console.error('Error en la ruta /pacientes:', err);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

// Ruta para registrar un nuevo paciente
router.post('/pacientes', async (req, res) => {
  try {
    const { nombre, apellidoPa, apellidoMa, fechaNacimiento, numeroTel, correo } = req.body;

    if (!nombre || !fechaNacimiento || !numeroTel || !correo) {
      return res.status(400).send('Datos incompletos. Verifica el nombre, fecha de nacimiento, número de teléfono y correo.');
    }

    const connection = await connectToDB();

    // Inserta el paciente usando la secuencia para ID_PACIENTE
    await connection.execute(
      `INSERT INTO PACIENTE (
        ID_PACIENTE, NOMBRE, APELLIDO_PA, APELLIDO_MA, FECHA_NAC, NUMERO_TEL, CORREO
      ) VALUES (
        SEQ_PACIENTE_ID.NEXTVAL, :nombre, :apellidoPa, :apellidoMa, TO_DATE(:fechaNacimiento, 'YYYY-MM-DD'), :numeroTel, :correo
      )`,
      { nombre, apellidoPa, apellidoMa, fechaNacimiento, numeroTel, correo },
      { autoCommit: true }
    );

    res.json({ message: 'Paciente registrado correctamente' });
  } catch (err) {
    console.error('Error al registrar el paciente:', err);
    res.status(500).send('Error al registrar el paciente');
  }
});

// Ruta para actualizar el estado de una cita y reagendarla
router.put('/citas/:id/reagendar', async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, hora } = req.body;

    if (!fecha || !hora) {
      return res.status(400).json({ error: 'Fecha y hora son requeridos' });
    }

    const connection = await connectToDB();
    await connection.execute(
      `UPDATE CITA 
       SET FECHA_REGISTRO = TO_DATE(:fecha, 'YYYY-MM-DD'), 
           HORA = TO_DATE(:hora, 'HH24:MI:SS'), 
           ESTADO_CITA = 'R' -- Usar abreviatura
       WHERE ID_CITA = :id`,
      { fecha, hora, id },
      { autoCommit: true }
    );

    res.json({ message: 'Cita reagendada con éxito.' });
  } catch (err) {
    console.error('Error al reagendar la cita:', err);
    res.status(500).json({ error: 'Error al reagendar la cita.' });
  }
});

// Ruta para actualizar el estado de una cita
router.put('/citas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).send('El estado es requerido.');
    }

    // Mapeo de estados
    const estados = {
      Pendiente: 'P',
      Aceptada: 'A',
      Rechazada: 'C',
      Reagendada: 'R'
    };

    const estadoCorto = estados[estado];
    if (!estadoCorto) {
      return res.status(400).send('Estado inválido. Debe ser uno de: Pendiente, Aceptada, Rechazada, Reagendada.');
    }

    const connection = await connectToDB();
    await connection.execute(
      `UPDATE CITA SET ESTADO_CITA = :estado WHERE ID_CITA = :id`,
      [estadoCorto, id],
      { autoCommit: true }
    );

    res.json({ message: 'Estado de la cita actualizado con éxito.' });
  } catch (err) {
    console.error('Error al actualizar el estado de la cita:', err);
    res.status(500).json({ error: 'Error al actualizar el estado de la cita.' });
  }
});

// Ruta para obtener recordatorios específicos para un dentista
router.get('/recordatorios', async (req, res) => {
  try {
    const { dentistaId } = req.query;

    // Validar que el dentistaId fue proporcionado
    if (!dentistaId) {
      return res.status(400).json({ message: 'El ID del dentista es requerido.' });
    }

    // Obtener la conexión a la base de datos
    const connection = await connectToDB();

    // Ejecutar la consulta para obtener los recordatorios
    const recordatorios = await connection.execute(
      `SELECT c.ID_CITA, 
              TO_CHAR(c.FECHA_REGISTRO, 'YYYY-MM-DD') AS FECHA_REGISTRO, 
              c.ESTADO_CITA, 
              TO_CHAR(c.HORA, 'HH24:MI') AS HORA, 
              p.NOMBRE AS PACIENTE
       FROM CITA c
       JOIN PACIENTE p ON c.ID_PACIENTE = p.ID_PACIENTE
       WHERE c.NUMERO_DE_EMPLEADO = :dentistaId
       ORDER BY c.FECHA_REGISTRO, c.HORA`,
      [dentistaId]
    );

    // Devolver los resultados en formato JSON
    res.json(recordatorios.rows);
  } catch (error) {
    console.error('Error al obtener recordatorios:', error);
    res.status(500).json({ message: 'Error al obtener recordatorios.' });
  }
});

// Ruta para enviar un recordatorio
router.get('/recordatorios', async (req, res) => {
  try {
    const { dentistaId } = req.query;

    if (!dentistaId) {
      return res.status(400).json({ message: 'El ID del dentista es obligatorio.' });
    }

    const connection = await connectToDB();

    const query = `
      SELECT 
        c.ID_CITA, 
        TO_CHAR(c.FECHA_REGISTRO, 'YYYY-MM-DD') AS FECHA, 
        c.ESTADO_CITA, 
        TO_CHAR(c.HORA, 'HH24:MI') AS HORA, 
        p.NOMBRE AS PACIENTE
      FROM 
        CITA c
      JOIN 
        PACIENTE p ON c.ID_PACIENTE = p.ID_PACIENTE
      WHERE 
        c.NUMERO_DE_EMPLEADO = :dentistaId
    `;

    const result = await connection.execute(query, [dentistaId]);

    // Procesar los datos para agregar mensajes personalizados
    const recordatorios = result.rows.map(row => ({
      citaId: row[0],
      fecha: row[1],
      estado: row[2],
      hora: row[3],
      paciente: row[4],
      mensaje: `Recordatorio: Tienes una cita con ${row[4]} el ${row[1]} a las ${row[3]}. Estado: ${row[2]}`
    }));

    res.json(recordatorios);
  } catch (error) {
    console.error('Error al obtener recordatorios:', error);
    res.status(500).json({ message: 'Error al obtener recordatorios.' });
  }
});

// Ruta para obtener pacientes asignados a un dentista
router.get('/pacientes', async (req, res) => {
  try {
    const { numeroDeEmpleado } = req.query;

    // Validación del parámetro
    if (!numeroDeEmpleado) {
      return res.status(400).send('El número de empleado es requerido');
    }

    const connection = await connectToDB();

    const result = await connection.execute(
      `SELECT * FROM PACIENTE WHERE NUMERO_DE_EMPLEADO = :numeroDeEmpleado`,
      [numeroDeEmpleado]
    );

    // Si no se encuentran pacientes, retornar un mensaje claro
    if (result.rows.length === 0) {
      return res.status(404).send('No se encontraron pacientes para este dentista');
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener los pacientes:', err);
    res.status(500).send('Error al obtener los pacientes');
  }
});


// Ruta para agregar paciente
// Ruta para agregar un paciente
router.post('/pacientes', async (req, res) => {
  try {
    const { id, nombre, apellidoPa, apellidoMa, fechaNac, genero, numeroTel, correo, tipo, estado, idContacto } = req.body;

    // Validar datos requeridos
    if (
      id === undefined || nombre === undefined || apellidoPa === undefined ||
      fechaNac === undefined || numeroTel === undefined || correo === undefined
    ) {
      return res.status(400).send('Faltan datos requeridos para agregar al paciente.');
    }
    
    const connection = await connectToDB();

    // Insertar datos en la tabla PACIENTE
    await connection.execute(
      `INSERT INTO PACIENTE (
        ID_PACIENTE, NOMBRE, APELLIDO_PA, APELLIDO_MA, FECHA_NAC, GENERO, NUMERO_TEL, CORREO, TIPO, ESTADO, ID_CONTANCTO
      ) VALUES (
        :id, :nombre, :apellidoPa, :apellidoMa, TO_DATE(:fechaNac, 'YYYY-MM-DD'), :genero, :numeroTel, :correo, :tipo, :estado, :idContacto
      )`,
      { id, nombre, apellidoPa, apellidoMa, fechaNac, genero, numeroTel, correo, tipo, estado, idContacto },
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
    const { nombre, apellidoPa, apellidoMa, genero, numeroTel, correo } = req.body;
    const { id } = req.params;

    // Validación de los datos requeridos
    if (!nombre || !numeroTel || !correo) {
      return res.status(400).send('Faltan datos obligatorios: nombre, número de teléfono y correo.');
    }

    const connection = await connectToDB();

    // Actualizar datos del paciente
    await connection.execute(
      `UPDATE PACIENTE 
       SET 
         NOMBRE = :nombre, 
         APELLIDO_PA = :apellidoPa, 
         APELLIDO_MA = :apellidoMa, 
         GENERO = :genero, 
         NUMERO_TEL = :numeroTel, 
         CORREO = :correo
       WHERE ID_PACIENTE = :id`,
      { nombre, apellidoPa, apellidoMa, genero, numeroTel, correo, id },
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

    // Eliminar diagnósticos relacionados
    await connection.execute(
      `DELETE FROM DIAGNOSTICO WHERE ID_CITA IN (SELECT ID_CITA FROM CITA WHERE ID_PACIENTE = :id)`,
      [id],
      { autoCommit: true }
    );

    // Eliminar citas relacionadas
    await connection.execute(
      `DELETE FROM CITA WHERE ID_PACIENTE = :id`,
      [id],
      { autoCommit: true }
    );

    // Eliminar al paciente
    await connection.execute(
      `DELETE FROM PACIENTE WHERE ID_PACIENTE = :id`,
      [id],
      { autoCommit: true }
    );

    res.json({ message: `Paciente con ID ${id} eliminado correctamente` });
  } catch (err) {
    console.error('Error al eliminar paciente:', err);
    res.status(500).send('Error al eliminar paciente');
  }
});



// Ruta para obtener el historial clínico completo de un paciente
router.get('/reporte-completo/:pacienteId', async (req, res) => {
  try {
    const connection = await connectToDB();
    const { pacienteId } = req.params;

    if (isNaN(pacienteId)) {
      return res.status(400).send('ID de paciente inválido');
    }

    const result = await connection.execute(
      `
      SELECT 
          p.ID_PACIENTE,
          p.NOMBRE AS NOMBRE_PACIENTE,
          p.APELLIDO_PA,
          p.APELLIDO_MA,
          p.FECHA_NAC,
          p.GENERO,
          p.NUMERO_TEL,
          p.CORREO,
          c.ID_CITA,
          c.FECHA_REGISTRO,
          c.HORA,
          c.ESTADO_CITA,
          c.TIPO_DE_CITA,
          d.ID_DIAGNOSTICO,
          d.DIAGNOSTICO,
          d.DESCRIPCION_DE_TRATAMIENTO,
          hmed.ID_HISTORIAL_MEDICAMENTO,
          hmed.MEDICAMENTO_HISTORIAL,
          hmed.FECHA_INICIO AS FECHA_MEDICAMENTO_INICIO,
          hmed.FECHA_TERMINO AS FECHA_MEDICAMENTO_TERMINO,
          med.ID_MEDICAMENTO,
          med.MEDICAMENTO
      FROM 
          PACIENTE p
      LEFT JOIN 
          CITA c ON p.ID_PACIENTE = c.ID_PACIENTE
      LEFT JOIN 
          DIAGNOSTICO d ON c.ID_CITA = d.ID_CITA
      LEFT JOIN 
          HISTORIAL_DE_MEDICAMENTO hmed ON d.ID_DIAGNOSTICO = hmed.ID_DIAGNOSTICO
      LEFT JOIN 
          MEDICAMENTO med ON hmed.ID_MEDICAMENTO = med.ID_MEDICAMENTO
      WHERE 
          p.ID_PACIENTE = :pacienteId
      ORDER BY 
          c.FECHA_REGISTRO DESC
      `,
      [pacienteId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('No se encontraron registros para este paciente');
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener el reporte completo:', err);
    res.status(500).send('Error al obtener el reporte completo');
  }
});

// Ruta para obtener el historial clínico reciente de un paciente
router.get('/historial-reciente/:pacienteId', async (req, res) => {
  try {
    const connection = await connectToDB();
    const { pacienteId } = req.params;

    const result = await connection.execute(
      `SELECT * 
       FROM (
         SELECT 
           c.ID_CITA, 
           c.FECHA_REGISTRO, 
           c.HORA, 
           d.DIAGNOSTICO,
           hmed.MEDICAMENTO_HISTORIAL,
           hmed.FECHA_INICIO,
           hmed.FECHA_TERMINO
         FROM CITA c
         LEFT JOIN DIAGNOSTICO d ON c.ID_CITA = d.ID_CITA
         LEFT JOIN HISTORIAL_DE_MEDICAMENTO hmed ON d.ID_DIAGNOSTICO = hmed.ID_DIAGNOSTICO
         WHERE c.ID_PACIENTE = :pacienteId
         ORDER BY c.FECHA_REGISTRO DESC
       ) 
       WHERE ROWNUM <= 5`,
      [pacienteId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('No se encontró historial clínico para este paciente.');
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener el historial reciente:', err);
    res.status(500).send('Error al obtener el historial reciente.');
  }
});

// Ruta para guardar el ticket de costos
router.post('/guardar-ticket', async (req, res) => {
  try {
    const { pacienteId, trabajosSeleccionados } = req.body;

    if (!pacienteId || !trabajosSeleccionados || trabajosSeleccionados.length === 0) {
      return res.status(400).send('El pacienteId y los trabajos seleccionados son obligatorios.');
    }

    const connection = await connectToDB();

    for (const trabajo of trabajosSeleccionados) {
      // Verificar si el registro ya existe
      const existeRegistro = await connection.execute(
        `SELECT COUNT(*) AS TOTAL
         FROM TRABAJO_CITA
         WHERE CITA_TRABAJO_CITA = :citaId
         AND TIPO_DE_TRABAJO_TRABAJO_CITA = :tipoTrabajo`,
        {
          citaId: trabajo.citaId,
          tipoTrabajo: trabajo.tipoTrabajo,
        }
      );

      if (existeRegistro.rows[0].TOTAL > 0) {
        console.log(
          `El trabajo con citaId ${trabajo.citaId} y tipoTrabajo ${trabajo.tipoTrabajo} ya existe.`
        );
        continue; // Omitir este registro si ya existe
      }

      // Insertar el registro si no existe
      await connection.execute(
        `INSERT INTO TRABAJO_CITA (CITA_TRABAJO_CITA, TIPO_DE_TRABAJO_TRABAJO_CITA, CANTIDAD)
         VALUES (:citaId, :tipoTrabajo, :cantidad)`,
        {
          citaId: trabajo.citaId,
          tipoTrabajo: trabajo.tipoTrabajo,
          cantidad: trabajo.cantidad,
        },
        { autoCommit: true }
      );
    }

    res.json({ message: 'Ticket guardado correctamente' });
  } catch (err) {
    console.error('Error al guardar el ticket:', err);
    res.status(500).send('Error al guardar el ticket');
  }
});



// Ruta para guardar la receta
router.post('/recetas', async (req, res) => {
  try {
    const { pacienteId, citaId, diagnostico, medicamentos } = req.body;

    if (!pacienteId || !citaId || !diagnostico || !medicamentos || medicamentos.length === 0) {
      return res.status(400).send('Todos los campos son requeridos: pacienteId, citaId, diagnóstico, medicamentos.');
    }

    const connection = await connectToDB();

    // Generar un ID_DIAGNOSTICO manualmente
    const idDiagnosticoResult = await connection.execute(
      `SELECT NVL(MAX(ID_DIAGNOSTICO), 0) + 1 AS ID_DIAGNOSTICO FROM DIAGNOSTICO`
    );
    const idDiagnostico = idDiagnosticoResult.rows[0].ID_DIAGNOSTICO;

    // Insertar diagnóstico en la tabla DIAGNOSTICO
    await connection.execute(
      `INSERT INTO DIAGNOSTICO (ID_DIAGNOSTICO, ID_CITA, DIAGNOSTICO) 
       VALUES (:idDiagnostico, :citaId, :diagnostico)`,
      { idDiagnostico, citaId, diagnostico },
      { autoCommit: false }
    );

    // Insertar medicamentos asociados en la tabla HISTORIAL_DE_MEDICAMENTO
    for (const medicamento of medicamentos) {
      await connection.execute(
        `INSERT INTO HISTORIAL_DE_MEDICAMENTO (ID_DIAGNOSTICO, NOMBRE_MEDICAMENTO, DOSIS, FRECUENCIA) 
         VALUES (:idDiagnostico, :nombreMedicamento, :dosis, :frecuencia)`,
        {
          idDiagnostico,
          nombreMedicamento: medicamento.nombre,
          dosis: medicamento.dosis,
          frecuencia: medicamento.frecuencia,
        }
      );
    }

    // Confirmar la transacción
    await connection.commit();

    res.json({ message: 'Receta guardada correctamente' });
  } catch (err) {
    console.error('Error al guardar la receta:', err);
    res.status(500).send('Error al guardar la receta');
  }
});



//Historial de recetas 
router.get('/recetas/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const connection = await connectToDB();

    // Obtener las recetas basadas en el historial de medicamentos y diagnósticos
    const result = await connection.execute(
      `SELECT 
          C.ID_CITA, 
          C.FECHA_REGISTRO AS FECHA_CITA, 
          D.DIAGNOSTICO, 
          M.NOMBRE_MEDICAMENTO AS MEDICAMENTO, 
          M.DOSIS, 
          M.FRECUENCIA
       FROM DIAGNOSTICO D
       JOIN HISTORIAL_DE_MEDICAMENTO M ON D.ID_DIAGNOSTICO = M.ID_DIAGNOSTICO
       JOIN CITA C ON C.ID_CITA = D.ID_CITA
       WHERE C.ID_PACIENTE = :pacienteId`,
      [pacienteId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron recetas para este paciente.' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener el historial de recetas:', err);
    res.status(500).send('Error al obtener el historial de recetas');
  }
});

// Ruta para obtener el reporte por paciente
app.get('/api/reportes/paciente/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const connection = await connectToDB(); // Asegúrate de usar la conexión correcta

    // Obtener información del paciente
    const pacienteResult = await connection.execute(
      `SELECT NOMBRE, APELLIDO_PA, APELLIDO_MA 
       FROM PACIENTE 
       WHERE ID_PACIENTE = :pacienteId`,
      [pacienteId]
    );

    if (pacienteResult.rows.length === 0) {
      return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    // Obtener citas del paciente
    const citasResult = await connection.execute(
      `SELECT 
          C.ID_CITA, 
          C.FECHA_REGISTRO AS FECHA, 
          C.HORA, 
          C.ESTADO_CITA, 
          T.NOMBRE_TRABAJO AS TRATAMIENTO, 
          H.DIAGNOSTICO
       FROM CITA C
       LEFT JOIN TRABAJO_CITA TC ON C.ID_CITA = TC.CITA_TRABAJO_CITA
       LEFT JOIN TIPO_DE_TRABAJO T ON TC.TIPO_DE_TRABAJO_TRABAJO_CITA = T.ID_TIPO_DE_TRABAJO
       LEFT JOIN DIAGNOSTICO H ON C.ID_CITA = H.ID_CITA
       WHERE C.ID_PACIENTE = :pacienteId`,
      [pacienteId]
    );

    // Preparar el reporte
    const reportData = {
      paciente: {
        nombre: pacienteResult.rows[0].NOMBRE,
        apellidoPaterno: pacienteResult.rows[0].APELLIDO_PA,
        apellidoMaterno: pacienteResult.rows[0].APELLIDO_MA,
      },
      citas: citasResult.rows,
    };

    res.json(reportData);
  } catch (err) {
    console.error('Error al generar el reporte por paciente:', err);
    res.status(500).send({ message: 'Error al generar el reporte por paciente' });
  }
});

// Ruta para obtener el reporte general
app.get('/api/reportes/general', async (req, res) => {
  try {
    const connection = await connectToDB(); // Asegúrate de usar la conexión correcta

    const result = await connection.execute(
      `SELECT 
          C.ID_CITA, 
          P.NOMBRE AS PACIENTE, 
          D.NOMBRE AS DENTISTA, 
          C.FECHA_REGISTRO AS FECHA, 
          C.HORA, 
          C.TIPO_DE_CITA, 
          T.NOMBRE_TRABAJO, 
          T.COSTO
       FROM CITA C
       LEFT JOIN PACIENTE P ON C.ID_PACIENTE = P.ID_PACIENTE
       LEFT JOIN DENTISTA D ON C.NUMERO_DE_EMPLEADO = D.NUMERO_DE_EMPLEADO
       LEFT JOIN TRABAJO_CITA TC ON C.ID_CITA = TC.CITA_TRABAJO_CITA
       LEFT JOIN TIPO_DE_TRABAJO T ON TC.TIPO_DE_TRABAJO_TRABAJO_CITA = T.ID_TIPO_DE_TRABAJO`
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error al generar el reporte general:', err);
    res.status(500).send({ message: 'Error al generar el reporte general' });
  }
});



// Ruta para obtener el contador de pacientes asignados
router.get('/paneles/pacientes-asignados', async (req, res) => {
  try {
    const { numeroDeEmpleado } = req.query;

    // Validar que se proporcione el número de empleado
    if (!numeroDeEmpleado) {
      return res.status(400).send('El número de empleado es requerido');
    }

    const connection = await connectToDB();

    // Ajustar la consulta para usar la relación correcta entre las tablas
    const result = await connection.execute(
      `SELECT COUNT(DISTINCT P.ID_PACIENTE) AS TOTAL
       FROM PACIENTE P
       JOIN CITA C ON P.ID_PACIENTE = C.ID_PACIENTE
       WHERE C.NUMERO_DE_EMPLEADO = :numeroDeEmpleado`,
      [numeroDeEmpleado]
    );

    res.json({ totalPacientes: result.rows[0]?.TOTAL || 0 });
  } catch (err) {
    console.error('Error al obtener el conteo de pacientes asignados:', err);
    res.status(500).send('Error al obtener el conteo de pacientes asignados');
  }
});


// Ruta para obtener el contador de citas del día
router.get('/paneles/citas-del-dia', async (req, res) => {
  try {
    const { numeroDeEmpleado } = req.query;

    // Validar que se proporcione el número de empleado
    if (!numeroDeEmpleado) {
      return res.status(400).send('El número de empleado es requerido');
    }

    const connection = await connectToDB();

    const result = await connection.execute(
      `SELECT COUNT(*) AS TOTAL
       FROM CITA
       WHERE TRUNC(FECHA_REGISTRO) = TRUNC(SYSDATE)
       AND NUMERO_DE_EMPLEADO = :numeroDeEmpleado`,
      [numeroDeEmpleado]
    );

    res.json({ totalCitas: result.rows[0]?.TOTAL || 0 });
  } catch (err) {
    console.error('Error al obtener el conteo de citas del día:', err);
    res.status(500).send('Error al obtener el conteo de citas del día');
  }
});


// Ruta para obtener el contador de procedimientos del mes
router.get('/paneles/procedimientos-del-mes/:numeroDeEmpleado', async (req, res) => {
  try {
    const { numeroDeEmpleado } = req.params; // Usamos req.params para obtener el número de empleado

    if (!numeroDeEmpleado) {
      return res.status(400).send('El número de empleado es requerido');
    }

    const connection = await connectToDB();

    const result = await connection.execute(
      `SELECT COUNT(*) AS TOTAL
       FROM TRABAJO_CITA TC
       JOIN CITA C ON TC.CITA_TRABAJO_CITA = C.ID_CITA
       WHERE EXTRACT(MONTH FROM C.FECHA_REGISTRO) = EXTRACT(MONTH FROM SYSDATE)
       AND C.NUMERO_DE_EMPLEADO = :numeroDeEmpleado`,
      { numeroDeEmpleado }
    );

    res.json({ totalProcedimientos: result.rows[0]?.TOTAL || 0 });
  } catch (err) {
    console.error('Error al obtener el conteo de procedimientos del mes:', err);
    res.status(500).send('Error al obtener el conteo de procedimientos del mes');
  }
});


// Ruta para buscar pacientes y dentistas
router.post('/buscar', async (req, res) => {
  try {
    const { busqueda } = req.body;

    if (!busqueda) {
      return res.status(400).json({ message: 'El campo de búsqueda es requerido.' });
    }

    const connection = await connectToDB();

    const queryPacientes = `
      SELECT 
        'PACIENTE' AS tipo, 
        ID_PACIENTE AS id, 
        NOMBRE AS nombre 
      FROM PACIENTE 
      WHERE ID_PACIENTE = :busqueda 
        OR NOMBRE LIKE '%' || :busqueda || '%'`;

    const queryDentistas = `
      SELECT 
        'DENTISTA' AS tipo, 
        NUMERO_DE_EMPLEADO AS id, 
        NOMBRE AS nombre 
      FROM DENTISTA 
      WHERE NUMERO_DE_EMPLEADO = :busqueda 
        OR NOMBRE LIKE '%' || :busqueda || '%'`;

    // Ejecutar ambas consultas y combinar resultados con UNION
    const result = await connection.execute(
      `${queryPacientes} UNION ${queryDentistas}`,
      { busqueda }
    );

    if (result.rows.length > 0) {
      res.json(result.rows);
    } else {
      res.json({ message: 'No se encontraron resultados.' });
    }
  } catch (err) {
    console.error('Error al buscar:', err);
    res.status(500).json({ message: 'Error en el servidor.' });
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
        console.error(`El puerto ${port} ya está en uso. Intenta usar otro puerto.`);
      } else {
        console.error('Error inesperado en el servidor:', err);
      }
    });
  } catch (err) {
    console.error('Error al intentar iniciar el servidor. Verifica la conexión a la base de datos:', err);
  }
}

startServer();