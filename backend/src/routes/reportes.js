import { Router } from 'express';
import { fetchCursor, SCHEMA } from '../db.js';

const router = Router();
const PKG = `${SCHEMA.REPORTES}.PKG_REPORTES`;

// REP01 — Cartera total de préstamos agrupada por estado
//   GET /api/reportes/cartera
router.get('/cartera', async (req, res) => {
  try {
    const data = await fetchCursor(`${PKG}.cartera_por_estado()`);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// REP02 — Índice de morosidad por mes
//   GET /api/reportes/morosidad
router.get('/morosidad', async (req, res) => {
  try {
    const data = await fetchCursor(`${PKG}.indice_morosidad()`);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// REP03 — Ranking de clientes por monto prestado (RANK analítico); ?top=10
//   GET /api/reportes/ranking-clientes
router.get('/ranking-clientes', async (req, res) => {
  const top = req.query.top ? Number(req.query.top) : 10;
  try {
    const data = await fetchCursor(`${PKG}.ranking_clientes(:t)`, { t: top });
    res.json({ ok: true, data });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// REP04 — Recaudación por período (mes)
//   GET /api/reportes/recaudacion
router.get('/recaudacion', async (req, res) => {
  try {
    const data = await fetchCursor(`${PKG}.recaudacion_mensual()`);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// REP05 — Distribución de préstamos por tipo y calificación
//   GET /api/reportes/distribucion
router.get('/distribucion', async (req, res) => {
  try {
    const data = await fetchCursor(`${PKG}.distribucion_por_tipo()`);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

export default router;
