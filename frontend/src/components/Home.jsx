import React from 'react';
import { ActionGrid } from '../ui.jsx';

export default function Home({ user, sections, onSelect }) {
  return (
    <div className="home-hero">
      <h2>Hola, {user.username}</h2>
      <p className="muted">Elige una sección para comenzar.</p>
      <ActionGrid items={sections} onSelect={onSelect} />
    </div>
  );
}
