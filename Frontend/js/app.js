const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const oracledb = require('oracledb');
const apiRoutes = require('./api');
const app = express();
const port = 3000;

async function init() {
  try {
    await oracledb.createPool({
      user: '',
      password: '',
      connectString: ''
    });
    console.log('Connection pool started');
  } catch (err) {
    console.error('init() error: ' + err.message);
  }
}

async function close() {
  try {
    await oracledb.getPool().close(0);
    console.log('Connection pool closed');
  } catch (err) {
    console.error('close() error: ' + err.message);
  }
}

process
  .once('SIGTERM', close)
  .once('SIGINT', close);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Front_Administrador'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.render('FrontAdmin');
});

app.listen(port, async () => {
  await init();
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
