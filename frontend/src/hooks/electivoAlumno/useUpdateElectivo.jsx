import { updateElectivo } from "@services/electivoLista.service";
import { showErrorAlert, showSuccessAlert } from "@helpers/sweetAlert";

export default function useUpdateElectivo(fetchMisElectivos) {
  const handleUpdate = async (id, nuevaPosicion) => {
    if (!id || !nuevaPosicion) return;

    const resp = await updateElectivo(id, { posicion: nuevaPosicion });

    if (!resp || resp?.status !== "Success") {
      return showErrorAlert(
        "Error",
        resp?.details || resp?.message || "No se pudo actualizar el electivo."
      );
    }

    showSuccessAlert(
      "Actualizado",
      "La prioridad del electivo fue actualizada correctamente."
    );

    if (typeof fetchMisElectivos === "function") {
      fetchMisElectivos();
    }
  };

  return { handleUpdate };
}
