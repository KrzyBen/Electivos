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
import Table from "@components/Table";

import "@styles/al-mis-electivos.css";

import { deleteDataAlert } from "@helpers/sweetAlert";
import Swal from "sweetalert2";

// Ícono delete
import deleteIcon from "@assets/deleteIcon.svg";

export default function MisElectivos() {
  const { misElectivos, fetchMisElectivos } = useMisElectivos();
  const { electivos, fetchElectivos } = useElectivosDisponibles();
  const { handleAdd } = useAddElectivo(fetchMisElectivos);
  const { handleUpdate } = useUpdateElectivo(fetchMisElectivos);

  const { handleDelete } = useDeleteElectivo(fetchMisElectivos);

  const { handleEnviar } = useEnviarLista(fetchMisElectivos);

  const [showAdd, setShowAdd] = useState(false);

  const [showReplace, setShowReplace] = useState(false);
  const [selectedOldElectivo, setSelectedOldElectivo] = useState(null);
  const { handleReplace } = useReplaceElectivo(fetchMisElectivos);
  const { isActive, loading } = useActiveRegistrationPeriod();


  const columns = [
    { title: "Posición", field: "prioridad" },
    { title: "Electivo", field: "nombre" },
    { title: "Horario", field: "horario" },
    { title: "Estado", field: "estado" },
    {
      title: "Editar Prioridad",
      field: "editar_prioridad",
      hozAlign: "center",
      headerSort: false,
      formatter: () => {
        return `<button class="al-btn-edit" style="padding:4px 8px; cursor:pointer;">Editar</button>`;
      },
      cellClick: async (e, cell) => {
        const row = cell.getRow().getData();
        await onUpdateClick(row);  
      }
    },
    {
      title: "Reemplazar",
      field: "reemplazar",
      hozAlign: "center",
      headerSort: false,
      formatter: () => {
        return `<button class="al-btn-edit" style="padding:4px 8px; cursor:pointer;">Reemplazar</button>`;
      },
      cellClick: async (e, cell) => {
        const row = cell.getRow().getData();
        await onReplaceClick(row);
      }
    },
    {
      title: "Eliminar",
      field: "acciones",
      hozAlign: "center",
      headerSort: false,
      formatter: () => {
        return `<img src="${deleteIcon}" alt="delete" style="width:22px; cursor:pointer;" />`;
      },
      cellClick: async (e, cell) => {
        const row = cell.getRow().getData();
        await onDeleteClick(row.listaId);
      }
    }
  ];

  const onUpdateClick = async (row) => {
    const {  listaId, prioridad } = row;

    const result = await Swal.fire({
      title: "Cambiar Prioridad",
      text: "Ingresa la nueva posición del electivo",
      input: "number",
      inputValue: prioridad,
      inputAttributes: {
        min: 1
      },
      showCancelButton: true,
      confirmButtonText: "Actualizar"
    });

    if (result.isConfirmed && result.value) {
      const nuevaPosicion = Number(result.value);
      await handleUpdate( listaId, nuevaPosicion);
      fetchMisElectivos();
    }
  };

  const onReplaceClick = async (row) => {
    console.log("Replacing electivo:", row);
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
      <div className="al-table-container">
        <h1 className="al-title-table">Mis Electivos</h1>

        <div className="al-actions">
          <button
            onClick={() => {
              fetchElectivos();
              setShowAdd(true);
            }}
            className="al-btn-replace"
          >
            Añadir Electivo
          </button>

          <button
            onClick={handleEnviar}
            className="al-btn-confirm"
            style={{ marginLeft: "10px" }}
          >
            Enviar Lista
          </button>
        </div>

        <Table
          data={misElectivos}
          columns={columns}
          onSelectionChange={() => {}}
          dataToFilter="nombre"
          initialSortName="prioridad"
        />

      </div>

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