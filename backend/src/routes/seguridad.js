import { Router } from 'express';
import oracledb from 'oracledb';
import { run, SCHEMA } from '../db.js';

const router = Router();
const PKG = `${SCHEMA.SEGURIDAD}.PKG_SEGURIDAD`;

// SEG02 — Verificar si un usuario tiene permiso para una operación.
//   GET /api/seguridad/permisos?id_usuario=5&cod=APROBAR_PRESTAMO
// Devuelve { permitido: true|false }. Ideal para demostrar que el GERENTE
// NO puede aprobar préstamos (solo VER_REPORTES).
router.get('/permisos', async (req, res) => {
  const { id_usuario, cod } = req.query;
  try {
    const r = await run(
      `BEGIN :sal := ${PKG}.tiene_permiso(:u, :c); END;`,
      {
        u: Number(id_usuario),
        c: cod,
        sal: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 2 },
      }
    );
    res.json({ ok: true, permitido: r.outBinds.sal === 'SI' });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// SEG03 — Registrar auditoría (bitácora de acciones).
//   POST /api/seguridad/auditoria
router.post('/auditoria', async (req, res) => {
  const { id_usuario, accion, entidad, id_registro, detalle } = req.body;
  try {
    await run(
      `BEGIN ${PKG}.registrar_auditoria(:u, :a, :e, :r, :d); END;`,
      { u: id_usuario, a: accion, e: entidad, r: id_registro ?? null, d: detalle }
    );
    res.json({ ok: true, mensaje: 'Auditoría registrada' });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// SEG04 — Desbloquear usuario (tras 3 intentos fallidos lo bloquea el sistema).
//   POST /api/seguridad/usuarios/:id/desbloquear
router.post('/usuarios/:id/desbloquear', async (req, res) => {
  try {
    await run(`BEGIN ${PKG}.desbloquear_usuario(:id); END;`, { id: Number(req.params.id) });
    res.json({ ok: true, mensaje: 'Usuario desbloqueado' });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// SEG05 — Encriptar dato sensible (AES256). Devuelve el resultado en hexadecimal.
//   POST /api/seguridad/encriptar   body: { "texto": "40123456" }
router.post('/encriptar', async (req, res) => {
  try {
    const r = await run(
      `BEGIN :sal := ${PKG}.encriptar_dato(:t); END;`,
      {
        t: req.body.texto,
        sal: { dir: oracledb.BIND_OUT, type: oracledb.BUFFER, maxSize: 2000 },
      }
    );
    res.json({ ok: true, encriptado_hex: r.outBinds.sal.toString('hex').toUpperCase() });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// SEG05 — Desencriptar (solo con el dato en hex generado arriba).
//   POST /api/seguridad/desencriptar   body: { "hex": "A1B2..." }
router.post('/desencriptar', async (req, res) => {
  try {
    const r = await run(
      `BEGIN :sal := ${PKG}.desencriptar_dato(:d); END;`,
      {
        d: Buffer.from(req.body.hex, 'hex'),
        sal: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 2000 },
      }
    );
    res.json({ ok: true, texto: r.outBinds.sal });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

export default router;
