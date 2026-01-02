import React from "react";
import { formatHorario } from "@helpers/horarioFormat.helper.js";

export default function ElectivoCardBoard({ item, onUpdate, onReplace, onDelete }) {
  const { electivo, prioridad, estado } = item;

  return (
    <div className="al-cardboard-card">
      <h4 className="al-cardboard-title">{electivo.titulo}</h4>

      <div className="al-cardboard-section">
        <p><strong>Horario:</strong> {formatHorario(electivo)}</p>
        <p><strong>Hora:</strong> {electivo.horaInicio} – {electivo.horaFinal}</p>
        <p><strong>Prioridad:</strong> {prioridad}</p>
        <p><strong>Estado:</strong> {estado || "Pendiente"}</p>
      </div>

      <div className="al-cardboard-actions">
        <button onClick={onUpdate} className="al-btn-card-edit">Editar</button>
        <button onClick={onReplace} className="al-btn-card-replace">Reemplazar</button>
        <button onClick={onDelete} className="al-btn-card-delete">Eliminar</button>
      </div>
    </div>
  );
}