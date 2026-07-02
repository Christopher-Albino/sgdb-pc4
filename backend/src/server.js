import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { initPool, run } from './db.js';

import authRouter from './routes/auth.js';
import valorRouter from './routes/valor.js';
import seguridadRouter from './routes/seguridad.js';
import administracionRouter from './routes/administracion.js';
import consultasRouter from './routes/consultas.js';
import reportesRouter from './routes/reportes.js';

const app = express();
app.use(cors());            // permite que el frontend (otro puerto) llame a la API
app.use(express.json());    // parsea el body JSON de las peticiones

// --- Endpoint de salud: prueba que Oracle responde ---
app.get('/api/health', async (req, res) => {
  try {
    const r = await run(`SELECT USER AS usuario, SYSDATE AS fecha FROM dual`);
    res.json({ ok: true, oracle: r.rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// --- Rutas por bloque de requerimientos (25 requerimientos) ---
app.use('/api/auth', authRouter);            // SEG01 (login)
app.use('/api/valor', valorRouter);          // VAL01-VAL05
app.use('/api/seguridad', seguridadRouter);  // SEG02-SEG05
app.use('/api/admin', administracionRouter); // ADM01-ADM05
app.use('/api/consultas', consultasRouter);  // CON01-CON05
app.use('/api/reportes', reportesRouter);    // REP01-REP05

const PORT = process.env.PORT || 3001;
initPool()
  .then(() => app.listen(PORT, () => console.log(`\n🚀 API escuchando en http://localhost:${PORT}\n`)))
  .catch((err) => {
    console.error(`\n✗ No se pudo conectar a Oracle: ${err.message}\n`);
    process.exit(1);
  });
