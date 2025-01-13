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

// Inicializa el router
const router = express.Router();
app.use('/api', router);

// API para inicializar datos
router.post('/initialize', async (req, res) => {
  try {
    const connection = await connectToDB();
    res.send('Datos inicializados correctamente.');
  } catch (err) {
    console.error('Error al inicializar los datos:', err);
    res.status(500).send('Error al inicializar los datos.');
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

    const result = await connection.execute(
      `INSERT INTO DENTISTA (NUMERO_DE_EMPLEADO, NOMBRE, APELLIDO_PA, APELLIDO_MA, ID_ESPECIALIDAD)
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

    if (result.rowsAffected > 0) {
      res.json({ message: 'Dentista agregado con éxito.' });
    } else {
      res.status(500).json({ message: 'No se pudo agregar el dentista.' });
    }
  } catch (err) {
    console.error('Error al agregar dentista:', err);
    res.status(500).json({ message: 'Error en el servidor al agregar dentista.', error: err.message });
  }
});

// API para agregar nuevos pacientes
router.post('/agregarPaciente', async (req, res) => {
  const { idPaciente, nombre, apellidoPa, apellidoMa, fechaNac, genero, numeroTel, correo, tipo, estado, contancto } = req.body;

  if (!idPaciente || !nombre || !apellidoPa || !fechaNac || !numeroTel || !correo) {
    return res.status(400).json({ message: 'Todos los campos obligatorios deben estar presentes.' });
  }

  try {
    const connection = await connectToDB();

    // Verificar si el ID ya existe
    const checkQuery = `SELECT COUNT(*) AS count FROM PACIENTE WHERE ID_PACIENTE = :idPaciente`;
    const checkResult = await connection.execute(checkQuery, { idPaciente }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    if (checkResult.rows[0].COUNT > 0) {
      return res.status(400).json({ message: `El ID del paciente (${idPaciente}) ya existe. Usa un ID diferente.` });
    }

    // Insertar el nuevo paciente
    const result = await connection.execute(
      `INSERT INTO PACIENTE (ID_PACIENTE, NOMBRE, APELLIDO_PA, APELLIDO_MA, FECHA_NAC, GENERO, NUMERO_TEL, CORREO, TIPO, ESTADO, ID_CONTANCTO)
       VALUES (:idPaciente, :nombre, :apellidoPa, :apellidoMa, TO_DATE(:fechaNac, 'YYYY-MM-DD'), :genero, :numeroTel, :correo, :tipo, :estado, :contancto)`,
      {
        idPaciente,
        nombre,
        apellidoPa,
        apellidoMa,
        fechaNac,
        genero,
        numeroTel,
        correo,
        tipo,
        estado,
        contancto,
      },
      { autoCommit: true }
    );

    if (result.rowsAffected > 0) {
      res.json({ message: 'Paciente agregado con éxito.' });
    } else {
      res.status(500).json({ message: 'No se pudo agregar el paciente.' });
    }
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

  const query = `
SELECT 
    'PACIENTE' AS tipo, 
    ID_PACIENTE AS id, 
    NOMBRE, 
    APELLIDO_PA, 
    APELLIDO_MA, 
    FECHA_NAC, 
    GENERO, 
    NUMERO_TEL, 
    CORREO, 
    TIPO, 
    ESTADO, 
    ID_CONTANCTO AS contacto,
    NULL AS especialidad
  FROM PACIENTE 
  WHERE ID_PACIENTE = :busquedaNumero OR LOWER(NOMBRE) LIKE LOWER(:busquedaTexto)
  
  UNION ALL
  
  SELECT 
    'DENTISTA' AS tipo, 
    NUMERO_DE_EMPLEADO AS id, 
    NOMBRE, 
    APELLIDO_PA, 
    APELLIDO_MA, 
    NULL AS fecha_nac, 
    NULL AS genero, 
    NULL AS numero_tel, 
    NULL AS correo, 
    NULL AS tipo, 
    NULL AS estado, 
    NULL AS contacto,
    (SELECT ESPECIALIDAD FROM ESPECIALIDAD WHERE ID_ESPECIALIDAD = DENTISTA.ID_ESPECIALIDAD) AS especialidad
  FROM DENTISTA 
  WHERE NUMERO_DE_EMPLEADO = :busquedaNumero OR LOWER(NOMBRE) LIKE LOWER(:busquedaTexto)
  `;

  try {
    const connection = await connectToDB();

    const results = await connection.execute(query, {
      busquedaNumero: isNaN(busqueda) ? null : parseInt(busqueda),
      busquedaTexto: `%${busqueda}%`,
    }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    if (results.rows.length > 0) {
      const formattedResults = results.rows.map((row) => ({
        tipo: row.TIPO,
        id: row.ID,
        nombre: row.NOMBRE,
        apellidoPa: row.APELLIDO_PA || '',
        apellidoMa: row.APELLIDO_MA || '',
        fechaNacimiento: row.FECHA_NAC || null,
        genero: row.GENERO || null,
        telefono: row.NUMERO_TEL || null,
        correo: row.CORREO || null,
        tipoSangre: row.TIPO || null,
        estado: row.ESTADO || null,
        contacto: row.CONTACTO || null,
        especialidad: row.ESPECIALIDAD || 'N/A', // Sólo para dentistas
      }));
      res.json(formattedResults);
    } else {
      res.json({ message: 'No se encontraron resultados.' });
    }
  } catch (err) {
    console.error('Error al ejecutar la consulta:', err);
    res.status(500).json({ message: 'Error en el servidor al ejecutar la búsqueda.', error: err.message });
  }
});

router.delete('/eliminarPaciente/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const connection = await connectToDB();

      const deleteQuery = `DELETE FROM PACIENTE WHERE ID_PACIENTE = :id`;
      const result = await connection.execute(deleteQuery, { id }, { autoCommit: true });

      if (result.rowsAffected > 0) {
          res.json({ message: `Paciente con ID ${id} eliminado con éxito.` });
      } else {
          res.status(404).json({ message: `Paciente con ID ${id} no encontrado.` });
      }
  } catch (err) {
      console.error('Error al eliminar paciente:', err);
      res.status(500).json({ message: 'Error en el servidor al eliminar paciente.', error: err.message });
  }
});


router.delete('/eliminarDentista/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const connection = await connectToDB();

      const deleteQuery = `DELETE FROM DENTISTA WHERE NUMERO_DE_EMPLEADO = :id`;
      const result = await connection.execute(deleteQuery, { id }, { autoCommit: true });

      if (result.rowsAffected > 0) {
          res.json({ message: `Dentista con ID ${id} eliminado con éxito.` });
      } else {
          res.status(404).json({ message: `Dentista con ID ${id} no encontrado.` });
      }
  } catch (err) {
      console.error('Error al eliminar dentista:', err);
      res.status(500).json({ message: 'Error en el servidor al eliminar dentista.', error: err.message });
  }
});


router.put('/editarPaciente/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, apellidoPa, apellidoMa, fechaNac, genero, numeroTel, correo, tipo, estado, contancto } = req.body;

  try {
      const connection = await connectToDB();

      const updateQuery = `
          UPDATE PACIENTE
          SET NOMBRE = :nombre,
              APELLIDO_PA = :apellidoPa,
              APELLIDO_MA = :apellidoMa,
              FECHA_NAC = TO_DATE(:fechaNac, 'YYYY-MM-DD'),
              GENERO = :genero,
              NUMERO_TEL = :numeroTel,
              CORREO = :correo,
              TIPO = :tipo,
              ESTADO = :estado,
              ID_CONTANCTO = :contancto
          WHERE ID_PACIENTE = :id
      `;
      const result = await connection.execute(updateQuery, {
          nombre,
          apellidoPa,
          apellidoMa,
          fechaNac,
          genero,
          numeroTel,
          correo,
          tipo,
          estado,
          contancto,
          id,
      }, { autoCommit: true });

      if (result.rowsAffected > 0) {
          res.json({ message: `Paciente con ID ${id} editado con éxito.` });
      } else {
          res.status(404).json({ message: `Paciente con ID ${id} no encontrado.` });
      }
  } catch (err) {
      console.error('Error al editar paciente:', err);
      res.status(500).json({ message: 'Error en el servidor al editar paciente.', error: err.message });
  }
});


router.put('/editarDentista/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, apellidoPa, apellidoMa, especialidadDentista } = req.body;

  try {
      const connection = await connectToDB();

      const updateQuery = `
          UPDATE DENTISTA
          SET NOMBRE = :nombre,
              APELLIDO_PA = :apellidoPa,
              APELLIDO_MA = :apellidoMa,
              ID_ESPECIALIDAD = :especialidadDentista
          WHERE NUMERO_DE_EMPLEADO = :id
      `;
      const result = await connection.execute(updateQuery, {
          nombre,
          apellidoPa,
          apellidoMa,
          especialidadDentista,
          id,
      }, { autoCommit: true });

      if (result.rowsAffected > 0) {
          res.json({ message: `Dentista con ID ${id} editado con éxito.` });
      } else {
          res.status(404).json({ message: `Dentista con ID ${id} no encontrado.` });
      }
  } catch (err) {
      console.error('Error al editar dentista:', err);
      res.status(500).json({ message: 'Error en el servidor al editar dentista.', error: err.message });
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
        console.error(`El puerto ${4000} ya está en uso. Intenta usar otro puerto.`);
      } else {
        console.error('Error inesperado en el servidor:', err);
      }
    });
  } catch (err) {
    console.error('Error al intentar iniciar el servidor. Verifica la conexión a la base de datos:', err);
  }
}

startServer();