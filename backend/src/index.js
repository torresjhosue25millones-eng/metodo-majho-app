require('dotenv').config();
const app = require('./app');
const { initDb } = require('./database/init');

const PORT = process.env.PORT || 5000;

initDb();

app.listen(PORT, () => {
  console.log(`\n🌸 Método MAJHO API corriendo en http://localhost:${PORT}`);
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}\n`);
});
