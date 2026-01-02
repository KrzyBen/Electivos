import React from "react";
import "../styles/popup.css";

export default function ConfirmationPopup({ show, onClose, onConfirm, message }) {
  if (!show) return null;
  return (
    <div className="bg">
      <div className="popup" style={{ maxWidth: 420, padding: 28, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.13)' }}>
        <div className="title" style={{ marginBottom: 16, textAlign: 'center', fontWeight: 700, fontSize: 20 }}>
          {message || "¿Estás seguro que deseas eliminar este electivo?"}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 0, width: '100%', justifyContent: 'center' }}>
          <button
            className="btn-validar"
            onClick={onConfirm}
            style={{ minWidth: 110, fontSize: 16, borderRadius: 8, padding: '8px 0' }}
          >
            Sí, eliminar
          </button>
          <button
            className="btn-eliminar"
            onClick={onClose}
            style={{ minWidth: 110, fontSize: 16, background: '#888', border: 'none', borderRadius: 8, padding: '8px 0' }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
