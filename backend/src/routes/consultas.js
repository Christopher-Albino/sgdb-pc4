import { Router } from 'express';
import { fetchCursor, SCHEMA } from '../db.js';

const router = Router();
const PKG = `${SCHEMA.NEGOCIO}.PKG_CONSULTAS`;

// CON01 — Cronograma de cuotas de un préstamo
//   GET /api/consultas/prestamos/:id/cronograma
router.get('/prestamos/:id/cronograma', async (req, res) => {
  try {
    const data = await fetchCursor(`${PKG}.consultar_cronograma(:id)`, { id: Number(req.params.id) });
    res.json({ ok: true, data });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// CON02 — Saldo y estado general de un préstamo
//   GET /api/consultas/prestamos/:id/estado
router.get('/prestamos/:id/estado', async (req, res) => {
  try {
    const data = await fetchCursor(`${PKG}.consultar_estado_prestamo(:id)`, { id: Number(req.params.id) });
    res.json({ ok: true, data: data[0] || null });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// CON03 — Historial de pagos de un cliente
//   GET /api/consultas/clientes/:id/pagos
router.get('/clientes/:id/pagos', async (req, res) => {
  try {
    const data = await fetchCursor(`${PKG}.consultar_historial_pagos(:id)`, { id: Number(req.params.id) });
    res.json({ ok: true, data });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// CON04 — Buscar clientes por nombre, apellido o DNI
//   GET /api/consultas/clientes?criterio=ramirez
router.get('/clientes', async (req, res) => {
  try {
    const data = await fetchCursor(`${PKG}.buscar_clientes(:c)`, { c: req.query.criterio || '' });
    res.json({ ok: true, data });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// CON05 — Cuotas vencidas / morosas (global o por cliente con ?id_cliente=)
//   GET /api/consultas/cuotas-morosas
router.get('/cuotas-morosas', async (req, res) => {
  const idCliente = req.query.id_cliente ? Number(req.query.id_cliente) : null;
  try {
    const data = await fetchCursor(`${PKG}.consultar_cuotas_morosas(:c)`, { c: idCliente });
    res.json({ ok: true, data });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

export default router;
