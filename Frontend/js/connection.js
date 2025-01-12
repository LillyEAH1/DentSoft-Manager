const oracledb = require('oracledb');

oracledb.initOracleClient({ libDir: 'C:\\instantclient-basic-windows.x64-23.6.0.24.10\\instantclient_23_6' });

async function connectToDB() {
  try {
    const connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    });
    console.log('Conexión a la base de datos exitosa');
    return connection;
  } catch (err) {
    console.error('Error conectando a la base de datos:', err);
    throw err;
  }
}

module.exports = connectToDB;

