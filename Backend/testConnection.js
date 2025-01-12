const oracledb = require('oracledb');

async function testConnection() {
  try {
    await oracledb.initOracleClient({ libDir: 'C:\\instantclient-basic-windows.x64-23.6.0.24.10\\instantclient_23_6' });
    const connection = await oracledb.getConnection({
      user: 'consultorio',
      password: 'dental1234',
      connectString: 'localhost:1521/XE'
    });
    console.log('Conexión exitosa');
    await connection.close();
  } catch (err) {
    console.error('Error al conectar:', err);
  }
}

testConnection();
