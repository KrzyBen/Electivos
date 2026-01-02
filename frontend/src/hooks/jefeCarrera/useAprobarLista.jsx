import { useState } from "react";
import { aprobarListaElectivos } from "@services/jefeCarreraElectivos.service.js";
import { showSuccessAlert, showErrorAlert } from "@helpers/sweetAlert";

export default function useAprobarLista(fetchLista) {
  const [loading, setLoading] = useState(false);

  const handleAprobarLista = async (alumnoId) => {
    if (!alumnoId) return;

    setLoading(true);
    try {
      const response = await aprobarListaElectivos(alumnoId);

      
      if (response && typeof response.aprobados === "number") {
        if (response.aprobados > 0) {
          showSuccessAlert(
            `Lista aprobada correctamente (${response.aprobados} electivo${response.aprobados > 1 ? "s" : ""} aprobado${response.aprobados > 1 ? "s" : ""})`
          );
        } else {
          showSuccessAlert("El alumno no tenía electivos pendientes para aprobar");
        }

        // Refrescar lista del alumno
        fetchLista(alumnoId);
      } else {
        // Cualquier otra respuesta se trata como error
        showErrorAlert(response?.message || "No se pudo aprobar la lista");
      }
    } catch (error) {
      showErrorAlert("Error al aprobar la lista");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleAprobarLista };
}