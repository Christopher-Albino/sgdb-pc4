import React, { useEffect, useState } from 'react';

function humanize(key) {
  return key.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Tabla genérica: recibe un arreglo de objetos y arma cabeceras con las claves.
// Si `rows` es un solo registro (no un arreglo), se muestra como tarjeta de detalle
// (etiqueta/valor) en vez de forzar una tabla de una sola fila.
export function ResultTable({ rows }) {
  if (!rows) return null;
  const isSingle = !Array.isArray(rows);
  const list = isSingle ? [rows] : rows;
  if (list.length === 0) return <p className="muted">Sin resultados.</p>;

  if (isSingle) {
    return (
      <dl className="detail-grid">
        {Object.entries(list[0]).map(([k, v]) => (
          <div key={k} className="detail-row">
            <dt>{humanize(k)}</dt>
            <dd>{formatCell(v)}</dd>
          </div>
        ))}
      </dl>
    );
  }

  const cols = Object.keys(list[0]);
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{cols.map((c) => <th key={c}>{humanize(c)}</th>)}</tr>
        </thead>
        <tbody>
          {list.map((row, i) => (
            <tr key={i}>
              {cols.map((c) => <td key={c}>{formatCell(row[c])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCell(v) {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return v.slice(0, 10);
  return String(v);
}

// Mensaje de éxito o error.
export function Msg({ result }) {
  if (!result) return null;
  return (
    <div className={`msg ${result.type}`}>
      {result.text}
    </div>
  );
}

// Set mínimo de íconos SVG (trazo simple) usados en los botones de acción.
const ICON_PATHS = {
  plus: 'M12 5v14M5 12h14',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM21 21l-4.3-4.3',
  calendar: 'M7 3v4M17 3v4M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z',
  wallet: 'M3 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1h2a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z M16 13h3',
  clock: 'M12 7v5l3 3M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  alert: 'M12 3 2 20h20L12 3ZM12 10v4M12 17h.01',
  edit: 'M4 21h4L19.5 9.5a2.1 2.1 0 0 0-3-3L5 18v3ZM14 6l3 3',
  users: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0',
  file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8l-5-5Z M14 3v5h5 M9 13h6 M9 17h6',
  chart: 'M4 20V10M10 20V4M16 20v-7M3 20h18',
  briefcase: 'M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7ZM4 12h16',
  shield: 'M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3Z',
  check: 'M20 6 9 17l-5-5',
  x: 'M18 6 6 18M6 6l12 12',
  cash: 'M2 7h20v10H2Z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  lock: 'M6 10V7a6 6 0 0 1 12 0v3M5 10h14a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a1 1 0 0 1 1-1Z',
  unlock: 'M6 10V7a6 6 0 0 1 11-3.5M5 10h14a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a1 1 0 0 1 1-1Z',
};

// Ícono simple en línea (sin dependencias externas).
export function Icon({ name, size = 24 }) {
  const d = ICON_PATHS[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// Tarjeta que envuelve cada sección de la app.
export function Card({ title, children }) {
  return (
    <div className="card">
      <div className="card-head">
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  );
}

// Ventana modal simple: se cierra con el botón ×, clic en el fondo, o tecla Escape.
export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Grilla de botones cuadrados (ícono + color) para elegir una acción.
export function ActionGrid({ items, onSelect }) {
  return (
    <div className="action-grid">
      {items.map((it) => (
        <button key={it.key} type="button" className="action-btn" title={it.desc} onClick={() => onSelect(it.key)}>
          <span className={`action-icon ${it.color || 'blue'}`}>
            <Icon name={it.icon} size={28} />
          </span>
          <span className="action-btn-title">{it.title}</span>
        </button>
      ))}
    </div>
  );
}

// Botón para volver de un formulario específico a la grilla de acciones.
export function BackButton({ onClick, label = 'Volver' }) {
  return (
    <button type="button" className="btn ghost back-btn" onClick={onClick}>← {label}</button>
  );
}

// Hub de acciones de un módulo: decide si mostrar el grid, una página de detalle,
// o un modal encima del grid — según `mode` de cada item ('page' por defecto, o 'modal').
// Si solo hay una acción de tipo página, se salta el grid y va directo a ella.
export function ActionHub({ items, user, backLabel }) {
  const singlePage = items.length === 1 && items[0].mode !== 'modal';
  const [openKey, setOpenKey] = useState(singlePage ? items[0].key : null);
  const [modalKey, setModalKey] = useState(null);
  const openItem = items.find((i) => i.key === openKey);
  const modalItem = items.find((i) => i.key === modalKey);

  if (openItem) {
    const { Comp } = openItem;
    return (
      <>
        {items.length > 1 && <BackButton onClick={() => setOpenKey(null)} label={backLabel} />}
        <Comp user={user} />
      </>
    );
  }

  return (
    <>
      <ActionGrid items={items} onSelect={(key) => {
        const item = items.find((i) => i.key === key);
        if (item.mode === 'modal') setModalKey(key); else setOpenKey(key);
      }} />
      {modalItem && (
        <Modal title={modalItem.title} onClose={() => setModalKey(null)}>
          <modalItem.Comp user={user} />
        </Modal>
      )}
    </>
  );
}

// Campo de formulario controlado.
export function Field({ label, value, onChange, type = 'text', ...rest }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
    </label>
  );
}

// Hook simple para manejar el estado de "cargando + resultado" de una acción.
export function useAction() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const runAction = async (fn) => {
    setLoading(true);
    setResult(null);
    try {
      const ok = await fn();
      setResult({ type: 'ok', text: ok });
    } catch (e) {
      setResult({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  };
  return { result, loading, runAction, setResult };
}
