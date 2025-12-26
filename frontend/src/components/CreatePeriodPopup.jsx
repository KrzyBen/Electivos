import { useState } from "react";
import "@styles/al-popup.css";

export default function CreatePeriodPopup({ show, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    nombre: '',
    fechaInicio: '',
    fechaTermino: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!show) return null;

  return (
    <div className="al-popup-overlay">
      <div className="al-popup-box" style={{ maxWidth: "500px" }}>
        <button className="al-popup-close" onClick={onClose}>×</button>
        <h2 className="al-popup-title">Crear Nuevo Período</h2>
        <form onSubmit={handleSubmit} className="al-popup-form">
          <label className="al-popup-label" htmlFor="nombre">Nombre del Período</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="al-popup-input"
            placeholder="Ej: Período 2024-2"
          />

          <label className="al-popup-label" htmlFor="fechaInicio">Fecha de Inicio</label>
          <input
            id="fechaInicio"
            name="fechaInicio"
            type="date"
            value={formData.fechaInicio}
            onChange={handleChange}
            required
            className="al-popup-input"
          />

          <label className="al-popup-label" htmlFor="fechaTermino">Fecha de Término</label>
          <input
            id="fechaTermino"
            name="fechaTermino"
            type="date"
            value={formData.fechaTermino}
            onChange={handleChange}
            required
            className="al-popup-input"
          />

          <div className="al-popup-actions">
            <button type="submit" className="al-btn-confirm">Crear Período</button>
            <button type="button" className="al-btn-cancel" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}