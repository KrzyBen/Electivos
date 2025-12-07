// src/components/PopupAddElectivo.jsx
import { useState } from "react";
import "@styles/al-popup.css";

export default function PopupAddElectivo({ electivosDisponibles = [], onSubmit, onClose }) {
  const [selected, setSelected] = useState(null);
  const [prioridad, setPrioridad] = useState("");

  return (
    <div className="al-popup-overlay" role="dialog" aria-modal="true">
      <div className="al-popup-box">
        <button className="al-popup-close" onClick={onClose} aria-label="Cerrar">×</button>

        <h2 className="al-popup-title">Selecciona un Electivo</h2>

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

        <form
          onSubmit={(ev) => {
                ev.preventDefault();
                if (!selected) return;
                const numPrioridad = Number(prioridad);

                console.log("Popup enviando al hook:", {
                    electivoId: selected,
                    posicion: numPrioridad
                });

                onSubmit(selected, numPrioridad);
                onClose();
                }}
          className="al-popup-form"
        >
          <label className="al-popup-label" htmlFor="prioridad">Prioridad</label>
          <input
            id="prioridad"
            className="al-popup-input"
            type="number"
            name="prioridad"
            min="1"
            required
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value)}
          />

          <div className="al-popup-actions">
            <button type="submit" disabled={!selected} className="al-btn-confirm">
              Añadir
            </button>
            <button type="button" className="al-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
