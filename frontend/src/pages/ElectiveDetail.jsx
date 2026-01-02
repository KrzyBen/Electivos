import React, { useEffect, useState } from "react";
// Utilidad para exportar los detalles del electivo como archivo de texto
function exportarElectivo(electivo) {
  const data = [
    `Título: ${electivo.titulo}`,
    `Contenidos: ${electivo.contenidos}`,
    `Cupo Máximo: ${electivo.cupoMaximo}`,
    `Horario: ${getDiaSemana(electivo.horario)}`,
    `Cupos: ${electivo.cupoDisponible} / ${electivo.cupoMaximo}`,
    `Requisitos: ${electivo.requisitos || 'Ninguno'}`,
    `Aceptado: ${electivo.validado ? 'Sí' : 'No'}`,
    `Profesor: ${electivo.profesor?.nombreCompleto || electivo.profesor?.email || ''}`
  ].join('\n');
  const blob = new Blob([data], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `electivo_${electivo.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
import { useParams, useNavigate } from "react-router-dom";
import { getElectiveById, downloadInscritosPDF } from "../services/elective.service";

import "../styles/electives.css";


const getDiaSemana = (fechaStr) => {
  if (!fechaStr) return '';
  const fecha = new Date(fechaStr);
  if (isNaN(fecha)) return '';
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return dias[fecha.getDay()];
};
const ElectiveDetail = () => {
  const user = JSON.parse(sessionStorage.getItem("usuario") || "null");
  const userRole = user?.rol;
  const { id } = useParams();
  const [elective, setElective] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleExportPDF = async () => {
    console.log("CLICK EXPORT PDF", id);

    try {
      const blob = await downloadInscritosPDF(id);

      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );

      const a = document.createElement("a");
      a.href = url;
      a.download = `inscritos_electivo_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al descargar PDF:", err);
      alert("No se pudo exportar el PDF de inscritos.");
    }
  };
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
          <p><strong>Horario:</strong> {getDiaSemana(elective.horario)}</p>
          <p><strong>Cupos:</strong> {elective.cupoDisponible} / {elective.cupoMaximo}</p>
          <p><strong>Requisitos:</strong> {elective.requisitos || 'Ninguno'}</p>
          <p><strong>Aceptado:</strong> <span className={elective.validado ? "estado-validado" : "estado-no-validado"}>{elective.validado ? 'Sí' : 'No'}</span></p>
          {elective.profesor && (
            <p><strong>Profesor:</strong> {elective.profesor.nombreCompleto || elective.profesor.email}</p>
          )}
          {userRole === "Profesor" && (
            <>
              <button
                className="btn exportar-btn"
                style={{
                  marginTop: '1rem',
                  background: 'linear-gradient(90deg, #28a745 0%, #218838 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1.3rem',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  fontSize: '1.08rem',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(40,167,69,0.10)',
                  letterSpacing: '0.5px',
                  transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
                  outline: 'none',
                  display: 'inline-block',
                }}
                onClick={handleExportPDF}
                onMouseOver={e => Object.assign(e.target.style, {
                  background: 'linear-gradient(90deg, #218838 0%, #28a745 100%)',
                  transform: 'translateY(-2px) scale(1.04)',
                  boxShadow: '0 4px 16px rgba(40,167,69,0.18)'
                })}
                onMouseOut={e => Object.assign(e.target.style, {
                  background: 'linear-gradient(90deg, #28a745 0%, #218838 100%)',
                  transform: '',
                  boxShadow: '0 2px 8px rgba(40,167,69,0.10)'
                })}
              >
                Exportar PDF de inscritos
              </button>
              <button
                className="btn exportar-btn"
                style={{
                  marginTop: '1rem',
                  marginLeft: '1rem',
                  background: 'linear-gradient(90deg, #007bff 0%, #0056b3 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1.3rem',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  fontSize: '1.08rem',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(0,123,255,0.10)',
                  letterSpacing: '0.5px',
                  transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
                  outline: 'none',
                  display: 'inline-block',
                }}
                onClick={() => exportarElectivo(elective)}
                onMouseOver={e => Object.assign(e.target.style, {
                  background: 'linear-gradient(90deg, #0056b3 0%, #007bff 100%)',
                  transform: 'translateY(-2px) scale(1.04)',
                  boxShadow: '0 4px 16px rgba(0,123,255,0.18)'
                })}
                onMouseOut={e => Object.assign(e.target.style, {
                  background: 'linear-gradient(90deg, #007bff 0%, #0056b3 100%)',
                  transform: '',
                  boxShadow: '0 2px 8px rgba(0,123,255,0.10)'
                })}
              >
                Exportar detalles TXT
              </button>
            </>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <button
          className="btn volver-btn"
          style={{
            background: 'linear-gradient(90deg, #0055a5 0%, #003366 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 1.3rem',
            cursor: 'pointer',
            textDecoration: 'none',
            fontSize: '1.08rem',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,85,165,0.10)',
            letterSpacing: '0.5px',
            transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
            outline: 'none',
            display: 'inline-block',
          }}
          onMouseOver={e => Object.assign(e.target.style, {
            background: 'linear-gradient(90deg, #003366 0%, #0055a5 100%)',
            transform: 'translateY(-2px) scale(1.04)',
            boxShadow: '0 4px 16px rgba(0,85,165,0.18)'
          })}
          onMouseOut={e => Object.assign(e.target.style, {
            background: 'linear-gradient(90deg, #0055a5 0%, #003366 100%)',
            transform: '',
            boxShadow: '0 2px 8px rgba(0,85,165,0.10)'
          })}
          onClick={() => navigate(-1)}
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default ElectiveDetail;
