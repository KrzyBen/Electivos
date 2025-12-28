// src/hooks/electivoAlumno/useAddElectivo.jsx
import { addElectivo } from "@services/electivoLista.service";
import { showErrorAlert, showSuccessAlert } from "@helpers/sweetAlert";

export default function useAddElectivo(fetchMisElectivos) {
  const handleAdd = async (electivoId, posicion) => {
    console.log("Hook recibió:", { electivoId, posicion });

    const body = { electivoId, posicion };
    console.log("Body enviado al backend:", body);

    const resp = await addElectivo(body);

    console.log("Respuesta del backend en hook:", resp);

    if (!resp) {
      showErrorAlert("Error", "Respuesta vacía del servidor");
      return;
    }

    const getErrorMessage = (resp) => {
      if (typeof resp?.message === "string") {
        return resp.message;
      }

      if (typeof resp?.message === "object" && resp?.message?.message) {
        return resp.message.message;
      }

      if (typeof resp?.details === "string") {
        return resp.details;
      }

      if (typeof resp?.details === "object" && resp?.details?.message) {
        return resp.details.message;
      }

      return "Ocurrió un error al agregar el electivo.";
    };

    if (resp?.status !== "Success") {
      showErrorAlert("Error", getErrorMessage(resp));
      return;
    }

    showSuccessAlert("Añadido", "Electivo agregado correctamente.");

    if (typeof fetchMisElectivos === "function") {
      fetchMisElectivos();
    }
  };

  return { handleAdd };
}