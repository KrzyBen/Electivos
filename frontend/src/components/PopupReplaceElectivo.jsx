// src/components/PopupReplaceElectivo.jsx
import { useState } from "react";
import "@styles/al-popup.css";

export default function PopupReplaceElectivo({
  electivosDisponibles = [],
  oldElectivo,
  onSubmit,
  onClose
}) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="al-popup-overlay" role="dialog" aria-modal="true">
      <div className="al-popup-box">
        <button className="al-popup-close" onClick={onClose} aria-label="Cerrar">×</button>

        <h2 className="al-popup-title">Reemplazar Electivo</h2>

        {/* MOSTRAR ELECTIVO QUE SE REEMPLAZARÁ */}
        <div
          style={{
            background: "#eef3ff",
            padding: "12px",
            borderRadius: "10px",
            marginBottom: "18px",
            border: "1px solid #ccd9ff"
          }}
        >
          <p><strong>Electivo actual:</strong> {oldElectivo?.nombre || "—"}</p>
          <p><strong>Horario:</strong> {oldElectivo?.horario || "—"}</p>
        </div>

        {/* LISTA DE ELECTIVOS DISPONIBLES */}
        {electivosDisponibles.length === 0 ? (
          <p>No hay electivos disponibles.</p>
        ) : (
          <div className="al-electivos-list" role="list">
            {electivosDisponibles.map((e) => (
              <div
                role="listitem"
                key={e.id}
                className={`al-electivo-card ${selected === e.id ? "selected" : ""}`}
                onClick={() => setSelected(e.id)}
                tabIndex={0}
                onKeyDown={(ev) => { if (ev.key === "Enter") setSelected(e.id); }}
                aria-pressed={selected === e.id}
              >
                <h3>{e.titulo}</h3>
                <p><strong>Profesor:</strong> {e.profesor?.nombreCompleto || "—"}</p>
                <p><strong>Horario:</strong> {e.horario || "—"}</p>
                <p><strong>Cupos:</strong> {e.cupoDisponible}/{e.cupoMaximo}</p>
              </div>
            ))}
          </div>
        )}

        {/* BOTONES */}
        <div className="al-popup-actions">
          <button
            className="al-btn-confirm"
            disabled={!selected}
            onClick={() => {
              if (!selected) return;
              const newId = Number(selected);
              console.log("Enviar reemplazo:", {
                oldId: oldElectivo.id,
                newId
              });
              onSubmit(newId);
              onClose();
            }}
          >
            Reemplazar
          </button>
          <button className="al-btn-cancel" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}