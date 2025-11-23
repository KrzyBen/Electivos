import { replaceElectivo } from "@services/electivoLista.service.js";
import { showSuccessAlert, showErrorAlert } from "@helpers/sweetAlert.js";

export default function useReplaceElectivo(fetchMisElectivos) {
  const handleReplace = async (oldElectivoId, newElectivoId) => {
    const result = await replaceElectivo({ oldElectivoId, newElectivoId });

    if (result?.status === "Client error") {
      return showErrorAlert("Error", result.details);
    }

    showSuccessAlert("Actualizado", "Se reemplazó correctamente.");
    fetchMisElectivos();
  };

  return { handleReplace };
}
