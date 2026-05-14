const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth');
const moduleRoutes = require('./routes/modules');
const journalRoutes = require('./routes/journal');
const affirmationRoutes = require('./routes/affirmations');
const childrenRoutes = require('./routes/children');
const questionnaireRoutes = require('./routes/questionnaire');
const actionPlanRoutes = require('./routes/actionPlan');
const emergencyRoutes = require('./routes/emergency');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false, // Vite assets need relaxed CSP
}));

const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
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

// Serve React frontend in production
const publicDir = path.join(__dirname, '../../public');
app.use(express.static(publicDir));
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
