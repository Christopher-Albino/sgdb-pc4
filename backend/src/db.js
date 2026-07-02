import oracledb from 'oracledb';
import 'dotenv/config';

// Que los resultados vengan como objetos { COLUMNA: valor } en vez de arrays.
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// node-oracledb v6 usa "Thin mode" por defecto: NO necesita Instant Client.

// Nombres de los esquemas dueños de los packages. Como el backend entra con
// C##G01_APP (que solo tiene EXECUTE), los packages se referencian así:
//   C##G01_SEGURIDAD.PKG_SEGURIDAD.validar_usuario(...)
export const SCHEMA = {
  SEGURIDAD: 'C##G01_SEGURIDAD',
  NEGOCIO: 'C##G01_NEGOCIO',
  REPORTES: 'C##G01_REPORTES',
};

// Un único pool con el usuario de aplicación.
export async function initPool() {
  await oracledb.createPool({
    user: process.env.APP_USER,
    password: process.env.APP_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING,
    poolMin: 1,
    poolMax: 5,
    poolAlias: 'default',
  });
  console.log(`✓ Pool creado con usuario ${process.env.APP_USER}`);
}

/**
 * Ejecuta SQL o un bloque PL/SQL y devuelve el resultado crudo de oracledb.
 * Úsalo para procedimientos y funciones que devuelven valores escalares.
 * @param {string} sql    SQL/PLSQL con binds (:nombre)
 * @param {object} binds  valores de los binds
 * @param {object} opts   opciones extra de oracledb
 */
export async function run(sql, binds = {}, opts = {}) {
  let conn;
  try {
    conn = await oracledb.getConnection(); // toma una conexión del pool 'default'
    return await conn.execute(sql, binds, { autoCommit: true, ...opts });
  } finally {
    if (conn) await conn.close(); // la devuelve al pool
  }
}

/**
 * Llama a una FUNCIÓN PL/SQL que devuelve un SYS_REFCURSOR y trae todas las filas.
 * @param {string} fnCall  llamada completa, ej:
 *                 'C##G01_NEGOCIO.PKG_CONSULTAS.consultar_cronograma(:id)'
 * @param {object} binds   binds de entrada que usa fnCall
 * @returns {Promise<object[]>} arreglo de filas
 */
export async function fetchCursor(fnCall, binds = {}) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `BEGIN :rc := ${fnCall}; END;`,
      { ...binds, rc: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
    );
    const rs = result.outBinds.rc;
    const rows = await rs.getRows();  // trae todas las filas del cursor
    await rs.close();
    return rows;
  } finally {
    if (conn) await conn.close();
  }
}

export async function closePool() {
  await oracledb.getPool('default').close(2);
}
