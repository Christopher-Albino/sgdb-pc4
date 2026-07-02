// Capa de acceso a la API REST (backend Express -> packages PL/SQL).
// Todas las llamadas van a "/api/..." y Vite las reenvía al backend :3001.

async function request(method, url, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const json = await res.json().catch(() => ({ ok: false, error: 'Respuesta no válida' }));
  if (!res.ok || json.ok === false) {
    throw new Error(json.error || `Error ${res.status}`);
  }
  return json;
}

const get = (url) => request('GET', url);
const post = (url, body) => request('POST', url, body);
const put = (url, body) => request('PUT', url, body);
const del = (url) => request('DELETE', url);

export const api = {
  // ---- SEG01: login ----
  login: (username, password) => post('/api/auth/login', { username, password }),

  // ---- PKG_VALOR (VAL01-05) ----
  registrarSolicitud: (d) => post('/api/valor/solicitudes', d),
  evaluarSolicitud: (id) => post(`/api/valor/solicitudes/${id}/evaluar`),
  decidirSolicitud: (id, decision, id_analista) =>
    post(`/api/valor/solicitudes/${id}/decidir`, { decision, id_analista }),
  generarCronograma: (idPrestamo) => post(`/api/valor/prestamos/${idPrestamo}/cronograma`),
  registrarPago: (d) => post('/api/valor/pagos', d),

  // ---- PKG_ADMINISTRACION (ADM01-05) ----
  registrarCliente: (d) => post('/api/admin/clientes', d),
  actualizarCliente: (id, d) => put(`/api/admin/clientes/${id}`, d),
  registrarTipoPrestamo: (d) => post('/api/admin/tipos-prestamo', d),
  actualizarTasa: (id, tasa) => put(`/api/admin/tipos-prestamo/${id}/tasa`, { tasa }),
  crearUsuario: (d) => post('/api/admin/usuarios', d),
  actualizarParametro: (codigo, valor, id_admin) =>
    put(`/api/admin/parametros/${codigo}`, { valor, id_admin }),
  agregarListaNegra: (d) => post('/api/admin/lista-negra', d),
  quitarListaNegra: (idCliente) => del(`/api/admin/lista-negra/${idCliente}`),

  // ---- PKG_SEGURIDAD (SEG02-05) ----
  verificarPermiso: (idUsuario, cod) =>
    get(`/api/seguridad/permisos?id_usuario=${idUsuario}&cod=${cod}`),
  registrarAuditoria: (d) => post('/api/seguridad/auditoria', d),
  desbloquearUsuario: (id) => post(`/api/seguridad/usuarios/${id}/desbloquear`),
  encriptar: (texto) => post('/api/seguridad/encriptar', { texto }),
  desencriptar: (hex) => post('/api/seguridad/desencriptar', { hex }),

  // ---- PKG_CONSULTAS (CON01-05) ----
  cronograma: (idPrestamo) => get(`/api/consultas/prestamos/${idPrestamo}/cronograma`),
  estadoPrestamo: (idPrestamo) => get(`/api/consultas/prestamos/${idPrestamo}/estado`),
  historialPagos: (idCliente) => get(`/api/consultas/clientes/${idCliente}/pagos`),
  buscarClientes: (criterio) => get(`/api/consultas/clientes?criterio=${encodeURIComponent(criterio)}`),
  cuotasMorosas: (idCliente) =>
    get(`/api/consultas/cuotas-morosas${idCliente ? `?id_cliente=${idCliente}` : ''}`),

  // ---- PKG_REPORTES (REP01-05) ----
  cartera: () => get('/api/reportes/cartera'),
  morosidad: () => get('/api/reportes/morosidad'),
  rankingClientes: (top) => get(`/api/reportes/ranking-clientes?top=${top || 10}`),
  recaudacion: () => get('/api/reportes/recaudacion'),
  distribucion: () => get('/api/reportes/distribucion'),
};
