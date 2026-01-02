import { useNavigate } from "react-router-dom";
import useMisElectivosAprobados from "@hooks/electivoAlumno/useMisElectivosAprobados";
import ElectivoAprobadoCard from "@components/ElectivoAprobadoCard";
import useDownloadMisElectivosPDF from "@hooks/electivoAlumno/useDownloadMisElectivosPDF";
import "@styles/aea-electivos.css";

export default function MisElectivosAprobados() {
  const { electivos, loading } = useMisElectivosAprobados();
  const { handleDownloadPDF } = useDownloadMisElectivosPDF();
  const navigate = useNavigate();

  // Definir días de la semana y preparar horario
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const horarioSemanal = dias.reduce((acc, dia) => {
    acc[dia] = [];
    return acc;
  }, {});

  electivos.forEach((item) => {
    const date = new Date(item.electivo.horario + "T00:00:00");
    const dia = dias[date.getDay() - 1] || "Domingo"; // ajustar domingo
    horarioSemanal[dia].push(item);
  });

  if (loading) {
    return (
      <div className="aea-container">
        <p>Cargando electivos aprobados...</p>
      </div>
    );
  }

  if (electivos.length === 0) {
    return (
      <div className="aea-container">
        <h2 className="aea-title">Mis Electivos Aprobados</h2>
        <p>No tienes electivos aprobados actualmente.</p>
        <button className="aea-btn-volver" onClick={() => navigate(-1)}>Volver</button>
      </div>
    );
  }

  return (
    <div className="aea-container">
      <h2 className="aea-title">Mis Electivos Aprobados</h2>
      <div className="aea-actions">
        <button className="aea-btn aea-btn-pdf" onClick={handleDownloadPDF}>
          Descargar PDF
        </button>

        <button className="aea-btn aea-btn-volver" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>

      <div className="aea-horario-grid">
        {dias.map((dia) => (
          <div key={dia} className="aea-horario-dia">
            <h4>{dia}</h4>
            {horarioSemanal[dia].length === 0 ? (
              <p style={{ fontSize: "0.8rem", color: "#555" }}>—</p>
            ) : (
              horarioSemanal[dia].map((item) => (
                <div
                  key={item.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/electives/${item.electivo.id}`)}
                >
                  <ElectivoAprobadoCard item={item} />
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
