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
      return showErrorAlert("Error", "Respuesta vacía del servidor");
    }
    const parseError = (err) => {
      if (!err) return "Error desconocido";
      if (typeof err === "string") return err;
      try {
        return JSON.stringify(err);
      } catch (_) {
        return String(err);
      }
    };

    if (resp?.status !== "Success") {
      return showErrorAlert(
        "Error",
        parseError(resp.details || resp.message)
      );
    }

    showSuccessAlert("Añadido", "Electivo agregado correctamente.");

    if (typeof fetchMisElectivos === "function") {
      fetchMisElectivos();
    }
  };

  return { handleAdd };
}