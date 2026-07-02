import React, { useState } from 'react';

// Tabla genérica: recibe un arreglo de objetos y arma cabeceras con las claves.
export function ResultTable({ rows }) {
  if (!rows) return null;
  const list = Array.isArray(rows) ? rows : [rows];
  if (list.length === 0) return <p className="muted">Sin resultados.</p>;
  const cols = Object.keys(list[0]);
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr>
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
      {result.type === 'error' ? '⚠ ' : '✓ '}{result.text}
    </div>
  );
}

// Tarjeta que envuelve cada requerimiento con su código y título.
export function Card({ code, title, children }) {
  return (
    <div className="card">
      <div className="card-head">
        <span className="code">{code}</span>
        <h3>{title}</h3>
      </div>
      {children}
    </div>
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
