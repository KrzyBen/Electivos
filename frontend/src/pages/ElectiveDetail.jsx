import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getElectiveById } from "../services/elective.service";
import "../styles/electives.css";

const ElectiveDetail = () => {
  const { id } = useParams();
  const [elective, setElective] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getElectiveById(id)
      .then((data) => {
        setElective(data.data || data);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar el electivo");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="electives-page"><h2>Cargando electivo...</h2></div>;
  if (error) return <div className="electives-page"><h2>{error}</h2></div>;
  if (!elective) return <div className="electives-page"><h2>No se encontró el electivo</h2></div>;

  return (
    <div className="electives-page">
      <button style={{marginBottom: '1rem'}} onClick={() => navigate(-1)}>
        Volver
      </button>
      <div className="elective-card" style={{maxWidth: 600, margin: '0 auto'}}>
        <div className="card-header">
          <h2>{elective.titulo}</h2>
        </div>
        <div className="card-body">
          <p><strong>Contenidos:</strong> {elective.contenidos}</p>
          <p><strong>Cupo Máximo:</strong> {elective.cupoMaximo}</p>
          <p><strong>Horario:</strong> {elective.horario}</p>
          <p><strong>Cupos:</strong> {elective.cupoDisponible} / {elective.cupoMaximo}</p>
          <p><strong>Requisitos:</strong> {elective.requisitos || 'Ninguno'}</p>
          <p><strong>Validado:</strong> {elective.validado ? 'Sí' : 'No'}</p>
          {elective.profesor && (
            <p><strong>Profesor:</strong> {elective.profesor.nombreCompleto || elective.profesor.email}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElectiveDetail;
