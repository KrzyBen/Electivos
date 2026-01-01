import { enviarLista } from "@services/electivoLista.service.js";
import { showErrorAlert, showSuccessAlert } from "@helpers/sweetAlert";

export default function useEnviarLista(fetchMisElectivos) {

  const handleEnviar = async () => {
    try {
      const resp = await enviarLista();

      console.log("Respuesta enviar lista:", resp);

      if (typeof resp !== "string") {
        const msg = resp?.message || "No se pudo enviar la lista.";
        return showErrorAlert("Error al enviar", msg);
      }

      showSuccessAlert("¡Enviado!", resp);

      if (typeof fetchMisElectivos === "function") {
        fetchMisElectivos();
      }

    } catch (error) {
      console.error("Error en handleEnviar:", error);
      showErrorAlert("Error al enviar", error.message || "Error inesperado.");
    }
  };

  return { handleEnviar };
}