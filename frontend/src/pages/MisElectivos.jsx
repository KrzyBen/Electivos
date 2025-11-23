import { useState } from "react";
import useMisElectivos from "@hooks/electivoAlumno/useMisElectivos";
import useElectivosDisponibles from "@hooks/electivoAlumno/useElectivosDisponibles";
import useReplaceElectivo from "@hooks/electivoAlumno/useReplaceElectivo";
import Table from "@components/Table";
import Popup from "@components/Popup";
import "@styles/al-mis-electivos.css";


export default function MisElectivos() {
  const { misElectivos, fetchMisElectivos } = useMisElectivos();
  const { electivos } = useElectivosDisponibles();
  const { handleReplace } = useReplaceElectivo(fetchMisElectivos);

  const [selectedRow, setSelectedRow] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const columns = [
    { title: "Electivo", field: "nombre" },
    { title: "Horario", field: "horario" },
    { title: "Docente", field: "docente" },
  ];

  const openReplace = () => {
    if (selectedRow.length > 0) {
      setShowPopup(true);
    }
  };

  const submitReplace = (formData) => {
    const oldElectivoId = selectedRow[0].id;
    handleReplace(oldElectivoId, formData.nuevoElectivo);
    setShowPopup(false);
  };

  return (
    <div className="al-main-container">
      <div className="al-table-container">
        <h1 className="al-title-table">Mis Electivos</h1>

        <button
          onClick={openReplace}
          disabled={selectedRow.length === 0}
          className="al-btn-replace"
        >
          Reemplazar
        </button>

        <Table
          data={misElectivos}
          columns={columns}
          onSelectionChange={setSelectedRow}
          dataToFilter="nombre"
          initialSortName="nombre"
        />
      </div>
    </div>
  );
}