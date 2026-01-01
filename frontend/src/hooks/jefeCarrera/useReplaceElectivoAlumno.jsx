// src/hooks/jefeCarrera/useReplaceElectivoAlumno.jsx
import { replaceElectivoAlumno } from "@services/jefeCarreraElectivos.service";
import { showSuccessAlert, showErrorAlert } from "@helpers/sweetAlert";

export default function useReplaceElectivoAlumno(fetchLista) {
  const handleReplace = async (alumnoId, oldElectivoId, newElectivoId) => {
    const resp = await replaceElectivoAlumno(
      alumnoId,
      oldElectivoId,
      newElectivoId
    );

    if (resp?.status !== "Success") {
      showErrorAlert("Error", resp?.message || "No se pudo reemplazar");
      return;
    }

    showSuccessAlert("Listo", "Electivo reemplazado correctamente");
    fetchLista(alumnoId);
  };

  return { handleReplace };
}