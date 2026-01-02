import { downloadMisElectivosAprobadosPDF } from "@services/electivoAprobado.service";
import { showErrorAlert, showSuccessAlert } from "@helpers/sweetAlert";

export default function useDownloadMisElectivosPDF() {

  const handleDownloadPDF = async () => {
    try {
      const blob = await downloadMisElectivosAprobadosPDF();

      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = "mis_electivos_aprobados.pdf";
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      showSuccessAlert("Descarga completa", "El PDF se descargó correctamente.");
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      showErrorAlert(
        "Error",
        error.details || "No se pudo descargar el PDF"
      );
    }
  };

  return { handleDownloadPDF };
}
