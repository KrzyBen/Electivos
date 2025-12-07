import { replaceElectivo } from "@services/electivoLista.service";
import { showErrorAlert, showSuccessAlert } from "@helpers/sweetAlert";

export default function useReplaceElectivo(fetchMisElectivos) {

  const handleReplace = async (oldElectivoId, newElectivoId) => {
    try {
      const body = {
        oldElectivoId: Number(oldElectivoId),
        newElectivoId: Number(newElectivoId)
      };

      const resp = await replaceElectivo(body);

      console.log('Response from replaceElectivo:', resp);

      // Como el backend devuelve directamente el objeto reemplazado,
      // mostramos un mensaje de éxito de forma manual
      if (!resp || !resp.id) {
        return showErrorAlert("Error al reemplazar", "No se pudo reemplazar el electivo");
      }

      showSuccessAlert("Reemplazado", "Electivo reemplazado correctamente.");

      if (typeof fetchMisElectivos === "function") {
        fetchMisElectivos();
      }

    } catch (error) {
      console.error("Error en handleReplace:", error);
      showErrorAlert("Error al reemplazar", error.message || "Error desconocido");
    }
  };

  return { handleReplace };
}