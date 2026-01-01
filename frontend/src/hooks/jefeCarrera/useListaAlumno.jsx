//src/hooks/jefeCarrera/useListaAlumno.jsx
import { useState } from "react";
import {
  getListaAlumno,
  updateEstadoElectivo,
} from "@services/jefeCarreraElectivos.service";
import { showSuccessAlert, showErrorAlert } from "@helpers/sweetAlert";

export default function useListaAlumno() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLista = async (alumnoId) => {
    setLoading(true);
    const resp = await getListaAlumno(alumnoId);
    if (resp) setLista(resp);
    setLoading(false);
  };

  const cambiarEstado = async (id, estado) => {
    const resp = await updateEstadoElectivo(id, estado);

    if (resp?.status !== "Success") {
      showErrorAlert("Error", resp?.message || "No se pudo actualizar");
      return;
    }

    showSuccessAlert("Actualizado", "Estado modificado correctamente");
    setLista((prev) =>
      prev.map((i) => (i.id === id ? { ...i, estado } : i))
    );
  };

  return { lista, loading, fetchLista, cambiarEstado };
}
