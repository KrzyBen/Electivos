// frontend/src/pages/JefeCarreraElectivesGestion.jsx
import { useState } from "react";
import useAlumnosCarrera from "@hooks/jefeCarrera/useAlumnosCarrera";
import useListaAlumno from "@hooks/jefeCarrera/useListaAlumno";
import useReplaceElectivoAlumno from "@hooks/jefeCarrera/useReplaceElectivoAlumno";
import JcElectivoCard from "@components/JcElectivoCard";
import PopupReplaceElectivo from "@components/PopupReplaceElectivo";
import useElectivosCarrera from "@hooks/jefeCarrera/useElectivosCarrera";


import "@styles/jc-electivos.css";

export default function JefeCarreraElectivesGestion() {
  const { alumnos, loading } = useAlumnosCarrera();
  const { lista, fetchLista, cambiarEstado } = useListaAlumno();
  const { handleReplace } = useReplaceElectivoAlumno(fetchLista);
  const [showReplace, setShowReplace] = useState(false);
  const [electivoActual, setElectivoActual] = useState(null);
  const { electivos } = useElectivosCarrera();



  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);

  if (loading) return <p>Cargando alumnos...</p>;

  return (
    <div className="jc-container">
      <h2 className="jc-title">Gestión de Electivos – Jefe de Carrera</h2>

      <div className="jc-alumnos-grid">
        {alumnos.map((a) => (
          <div
            key={a.id}
            className="jc-alumno-card"
            onClick={() => {
              setAlumnoSeleccionado(a.id);
              fetchLista(a.id);
            }}
          >
            <h3>{a.nombreCompleto}</h3>
            <p>{a.email}</p>
          </div>
        ))}
      </div>

      {lista.length > 0 && (
        <section className="jc-lista">
          <h3>Electivos del Alumno</h3>

          {lista.map((item) => (
            <JcElectivoCard
              key={item.id}
              item={item}
              onApprove={(id) => cambiarEstado(id, "aprobado")}
              onReject={(id) => cambiarEstado(id, "rechazado")}
              onReplace={(item) => {
                setElectivoActual({
                  ...item,
                  nombre: item.electivo.titulo
                });
                setShowReplace(true);
              }}
            />
          ))}
        </section>
      )}
      {showReplace && electivoActual && (
        <PopupReplaceElectivo
          oldElectivo={electivoActual}
          electivosDisponibles={electivos.filter(
            (e) => e.id !== electivoActual.electivo.id
          )}
          onClose={() => setShowReplace(false)}
          onSubmit={(newElectivoId) => {
            handleReplace(
              alumnoSeleccionado,
              electivoActual.electivo.id,
              newElectivoId
            );
          }}
        />
      )}
    </div>
  );
}