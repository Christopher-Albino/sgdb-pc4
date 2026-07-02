import { Router } from 'express';
import oracledb from 'oracledb';
import { run, SCHEMA } from '../db.js';

const router = Router();

/**
 * SEG01 — Autenticar usuario.
 *   POST /api/auth/login   body: { "username": "...", "password": "..." }
 *
 * Llama a sp_login_api (script 13), que internamente usa
 * PKG_SEGURIDAD.autenticar_usuario y además devuelve el id_usuario.
 * Devuelve el rol ('ADMINISTRADOR','ANALISTA','CAJERO','SUPERVISOR','GERENTE')
 * o 'DENEGADO' / 'BLOQUEADO'.
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ ok: false, error: 'Falta username o password' });
  }
  try {
    const result = await run(
      `BEGIN ${SCHEMA.SEGURIDAD}.sp_login_api(:username, :password, :id, :rol); END;`,
      {
        username,
        password,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        rol: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 30 },
      }
    );
    const rol = result.outBinds.rol;
    const idUsuario = result.outBinds.id;

    if (rol === 'DENEGADO') {
      return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos' });
    }
    if (rol === 'BLOQUEADO') {
      return res.status(403).json({ ok: false, error: 'Cuenta bloqueada por intentos fallidos' });
    }

    // Login correcto: el frontend guarda id y rol para las siguientes operaciones.
    res.json({ ok: true, usuario: { id: idUsuario, username, rol } });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
