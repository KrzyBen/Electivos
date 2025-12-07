import { deleteElectivo } from "@services/electivoLista.service";
import { showErrorAlert, showSuccessAlert } from "@helpers/sweetAlert";

export default function useDeleteElectivo(fetchMisElectivos) {
  const handleDelete = async (id) => {
    if (!id) return;

    const resp = await deleteElectivo(id);

    if (!resp || resp?.status !== "Success") {
      return showErrorAlert(
        "Error",
        resp?.details || resp?.message || "No se pudo eliminar el electivo."
      );
    }

    showSuccessAlert("Eliminado", "Electivo eliminado correctamente.");

    if (typeof fetchMisElectivos === "function") {
      fetchMisElectivos();
    }
  };

  return { handleDelete };
}