/*const express = require('express');
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
app.use(cors());
app.use(bodyParser.json());

const dbConfig = {
  user: 'consultorio',
  password: 'dental1234',
  connectString: 'localhost:1521/XE'
};

// Conexión a la base de datos
async function connectToDB() {
  try {
    console.log('Intentando conectar a la base de datos...');
    const connection = await oracledb.getConnection(dbConfig);
    console.log('Conexión a la base de datos exitosa');
    return connection;
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
    throw err;
  }
}

// Inicializa el router
const router = express.Router();
app.use('/api', router);

// API para inicializar datos
router.post('/initialize', async (req, res) => {
  try {
    const connection = await connectToDB();
    res.json({ message: 'Datos inicializados correctamente.' });
  } catch (err) {
    console.error('Error al inicializar datos:', err);
    res.status(500).json({ message: 'Error en el servidor al inicializar datos.', error: err.message });
  }
});

// API para agregar nuevos dentistas
router.post('/agregarDentista', async (req, res) => {
  const { numeroDeEmpleado, nombre, apellidoPa, apellidoMa, especialidadDentista } = req.body;

  if (!numeroDeEmpleado || !nombre || !apellidoPa || !especialidadDentista) {
    return res.status(400).json({ message: 'Todos los campos obligatorios deben estar presentes.' });
  }

  try {
    const connection = await connectToDB();

    await connection.execute(
      `INSERT INTO DENTISTA (NUMERO_DE_EMPLEADO, NOMBRE, APELLIDO_PA, APELLIDO_MA, ESPECIALIDAD_DENTISTA)
       VALUES (:numeroDeEmpleado, :nombre, :apellidoPa, :apellidoMa, :especialidadDentista)`,
      {
        numeroDeEmpleado,
        nombre,
        apellidoPa,
        apellidoMa: apellidoMa || null,
        especialidadDentista
      },
      { autoCommit: true }
    );

    res.json({ message: 'Dentista agregado con éxito.' });
  } catch (err) {
    console.error('Error al agregar dentista:', err);
    res.status(500).json({ message: 'Error en el servidor al agregar dentista.', error: err.message });
  }
});

// API para agregar nuevos pacientes
router.post('/agregarPaciente', async (req, res) => {
  const { idPaciente, nombre, apellidoPa, apellidoMa, fechaNac, genero, numeroTel, correo, tipoDeSangrePaciente, estadoCivilPaciente, contactoPaciente } = req.body;

  if (!idPaciente || !nombre || !apellidoPa || !fechaNac || !numeroTel || !correo) {
    return res.status(400).json({ message: 'Todos los campos obligatorios deben estar presentes.' });
  }

  try {
    const connection = await connectToDB();

    await connection.execute(
      `INSERT INTO PACIENTE (ID_PACIENTE, NOMBRE, APELLIDO_PA, APELLIDO_MA, FECHA_NAC, GENERO, NUMERO_TEL, CORREO, TIPO_DE_SANGRE_PACIENTE, ESTADO_CIVIL_PACIENTE, CONTACTO_PACIENTE)
       VALUES (:idPaciente, :nombre, :apellidoPa, :apellidoMa, TO_DATE(:fechaNac, 'YYYY-MM-DD'), :genero, :numeroTel, :correo, :tipoDeSangrePaciente, :estadoCivilPaciente, :contactoPaciente)`,
      {
        idPaciente,
        nombre,
        apellidoPa,
        apellidoMa: apellidoMa || null,
        fechaNac,
        genero,
        numeroTel,
        correo,
        tipoDeSangrePaciente,
        estadoCivilPaciente,
        contactoPaciente
      },
      { autoCommit: true }
    );

    res.json({ message: 'Paciente agregado con éxito.' });
  } catch (err) {
    console.error('Error al agregar paciente:', err);
    res.status(500).json({ message: 'Error en el servidor al agregar paciente.', error: err.message });
  }
});

// API para buscar pacientes y dentistas
router.post('/buscar', async (req, res) => {
  const { busqueda } = req.body;

  if (!busqueda) {
    return res.status(400).json({ message: 'El parámetro de búsqueda es obligatorio.' });
  }

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

    const results = await connection.execute(
      `${queryPacientes} UNION ${queryDentistas}`,
      {
        busquedaNumero: isNaN(busqueda) ? null : parseInt(busqueda),
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

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
*/