// src/components/JcElectivoCard.jsx
import "@styles/jc-electivos.css";

export default function JcElectivoCard({
  item,
  onApprove,
  onReject,
  onReplace,
}) {
  const { id, estado, posicion, electivo } = item;

  return (
    <div className="jc-electivo-card">
      {/* Título */}
      <h4 className="jc-electivo-title">
        {electivo.titulo}
      </h4>

      {/* Estado */}
      <p>
        <strong>Estado:</strong>{" "}
        <span className={`estado estado-${estado}`}>
          {estado}
        </span>
      </p>

      {/* Prioridad */}
      <p>
        <strong>Prioridad del alumno:</strong> {posicion}
      </p>

      {/* Profesor */}
      {electivo.profesor && (
        <p>
          <strong>Profesor:</strong>{" "}
          {electivo.profesor.nombreCompleto}
        </p>
      )}

      {/* Horario */}
      <p>
        <strong>Horario:</strong>{" "}
        {electivo.horaInicio} - {electivo.horaFinal}
      </p>

      {/* Contenidos */}
      {electivo.contenidos && (
        <div className="jc-electivo-section">
          <strong>Contenidos:</strong>
          <p className="jc-electivo-text">
            {electivo.contenidos}
          </p>
        </div>
      )}

      {/* Requisitos */}
      {electivo.requisitos && (
        <div className="jc-electivo-section">
          <strong>Requisitos:</strong>
          <p className="jc-electivo-text">
            {electivo.requisitos}
          </p>
        </div>
      )}

      {/* Botones */}
      <div className="jc-btn-group">
        <button
          className="jc-btn jc-btn-approve"
          disabled={estado === "aprobado"}
          onClick={() => onApprove(id)}
        >
          Aprobar
        </button>

        <button
          className="jc-btn jc-btn-reject"
          disabled={estado === "rechazado"}
          onClick={() => onReject(id)}
        >
          Rechazar
        </button>

        <button
          className="jc-btn jc-btn-replace"
          onClick={() => onReplace(item)}
        >
          Cambiar electivo
        </button>
      </div>
    </div>
  );
}