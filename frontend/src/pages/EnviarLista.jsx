import { enviarLista } from "@services/electivoLista.service";
import { showSuccessAlert, showErrorAlert } from "@helpers/sweetAlert.js";
import "@styles/al-enviar-lista.css";


export default function EnviarLista() {
  const handleSend = async () => {
    const resp = await enviarLista();

    if (resp?.status === "Client error") {
      return showErrorAlert("Error", resp.details);
    }

    showSuccessAlert("Enviado", "Tus electivos fueron enviados con éxito.");
  };

  return (
    <div className="al-send-container">
      <h1 className="al-send-title">Confirmar envío de lista</h1>

      <button onClick={handleSend} className="al-send-btn">
        Enviar ahora
      </button>
    </div>
  );
}
