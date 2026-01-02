import { useState } from "react";
// Hooks
import useMisElectivos from "@hooks/electivoAlumno/useMisElectivos";
import useElectivosDisponibles from "@hooks/electivoAlumno/useElectivosDisponibles";
import useAddElectivo from "@hooks/electivoAlumno/useAddElectivo";
import useDeleteElectivo from "@hooks/electivoAlumno/useDeleteElectivo";
import useUpdateElectivo from "@hooks/electivoAlumno/useUpdateElectivo";
import useReplaceElectivo from "@hooks/electivoAlumno/useReplaceElectivo";
import useEnviarLista from "@hooks/electivoAlumno/useEnviarLista";
import useActiveRegistrationPeriod from "@hooks/electivoAlumno/useActiveRegistrationPeriod";
// Componentes
import PopupReplaceElectivo from "@components/PopupReplaceElectivo";
import PopupAddElectivo from "@components/PopupAddElectivo";
import ElectivoCardBoard from "@components/ElectivoCardBoard";

import "@styles/al-mis-electivos.css";

import { deleteDataAlert } from "@helpers/sweetAlert";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function MisElectivos() {
  const navigate = useNavigate();

  const { misElectivos, fetchMisElectivos } = useMisElectivos();
  const { electivos, fetchElectivos } = useElectivosDisponibles();
  const { handleAdd } = useAddElectivo(fetchMisElectivos);
  const { handleUpdate } = useUpdateElectivo(fetchMisElectivos);
  const { handleDelete } = useDeleteElectivo(fetchMisElectivos);
  const { handleEnviar } = useEnviarLista(fetchMisElectivos);
  const { handleReplace } = useReplaceElectivo(fetchMisElectivos);
  const { isActive, loading } = useActiveRegistrationPeriod();

  const [showAdd, setShowAdd] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [selectedOldElectivo, setSelectedOldElectivo] = useState(null);

  // Funciones de acciones
  const onUpdateClick = async (listaId, prioridad) => {
    const result = await Swal.fire({
      title: "Cambiar Prioridad",
      text: "Ingresa la nueva posición del electivo",
      input: "number",
      inputValue: prioridad,
      inputAttributes: { min: 1 },
      showCancelButton: true,
      confirmButtonText: "Actualizar",
    });

    if (result.isConfirmed && result.value) {
      const nuevaPosicion = Number(result.value);
      await handleUpdate(listaId, nuevaPosicion);
      fetchMisElectivos();
    }
  };

  const onReplaceClick = async (row) => {
    setSelectedOldElectivo(row);
    await fetchElectivos();
    setShowReplace(true);
  };

  const onDeleteClick = async (id) => {
    const result = await deleteDataAlert();
    if (result.isConfirmed) {
      await handleDelete(id);
      Swal.fire("Eliminado", "El electivo ha sido eliminado.", "success");
      fetchMisElectivos();
    }
  };

  if (loading) {
    return (
      <div className="al-main-container">
        <p>Cargando período de inscripción...</p>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="al-table-container al-center-message">
        <h1 className="al-title-table centered-title">Mis Electivos</h1>
        <div className="al-alert-info">
          El período de inscripción no está activo.
          <br />
          No puedes modificar tu lista en este momento.
        </div>
      </div>
    );
  }

  return (
    <div className="al-main-container">
      <h1 className="al-title-table centered-title">Mis Electivos</h1> {/* Título agregado */}
      {/* Botones de acción */}
      <div className="al-actions">
        <button
          onClick={() => {
            fetchElectivos();
            setShowAdd(true);
          }}
          className="al-btn-action al-btn-add"
        >
          Añadir Electivo
        </button>

        <button
          onClick={handleEnviar}
          className="al-btn-action al-btn-send"
        >
          Enviar Lista
        </button>

        <button
          onClick={() => navigate("/electivos-aprobados")}
          className="al-btn-action al-btn-go"
        >
          Ir a Mis Electivos Aprobados
        </button>
      </div>

      {/* Lista de electivos */}
      {misElectivos.length === 0 ? (
        <p>No tienes electivos agregados actualmente.</p>
      ) : (
        <div className="al-cardboard-grid">
          {misElectivos.map((item) => (
            <ElectivoCardBoard
              key={item.listaId}
              item={item}
              onUpdate={() => onUpdateClick(item.listaId, item.prioridad)}
              onReplace={() => onReplaceClick(item)}
              onDelete={() => onDeleteClick(item.listaId)}
            />
          ))}
        </div>
      )}

      {/* Popups */}
      {showAdd && (
        <PopupAddElectivo
          electivosDisponibles={electivos}
          onSubmit={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}

      {showReplace && (
        <PopupReplaceElectivo
          electivosDisponibles={electivos}
          oldElectivo={selectedOldElectivo}
          onSubmit={async (newId) => {
            await handleReplace(selectedOldElectivo.electivoId, newId);
            setShowReplace(false);
          }}
          onClose={() => setShowReplace(false)}
        />
      )}
    </div>
  );
}