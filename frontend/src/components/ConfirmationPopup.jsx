import React from "react";
import "../styles/popup.css";

export default function ConfirmationPopup({ show, onClose, onConfirm, message }) {
  if (!show) return null;
  return (
    <div className="bg">
      <div className="popup" style={{ maxWidth: 380, padding: 32, minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div className="title" style={{ marginBottom: 18, textAlign: 'center', fontWeight: 700, fontSize: 20 }}>
          {message || "¿Estás seguro que deseas eliminar este electivo?"}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <button className="btn-validar" onClick={onConfirm} style={{ minWidth: 110, fontSize: 16 }}>
            Sí, eliminar
          </button>
          <button className="btn-eliminar" onClick={onClose} style={{ minWidth: 110, fontSize: 16, background: '#888', border: 'none' }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
