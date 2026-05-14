const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const moduleRoutes = require('./routes/modules');
const journalRoutes = require('./routes/journal');
const affirmationRoutes = require('./routes/affirmations');
const childrenRoutes = require('./routes/children');
const questionnaireRoutes = require('./routes/questionnaire');
const actionPlanRoutes = require('./routes/actionPlan');
const emergencyRoutes = require('./routes/emergency');

const app = express();

app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/affirmations', affirmationRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/questionnaire', questionnaireRoutes);
app.use('/api/plan', actionPlanRoutes);
app.use('/api/emergency', emergencyRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'Método MAJHO API' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
