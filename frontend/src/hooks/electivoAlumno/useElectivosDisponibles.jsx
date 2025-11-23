import { useEffect, useState } from "react";
import { getElectivosValidados } from "@services/electivoLista.service.js";
import { showErrorAlert } from "@helpers/sweetAlert.js";

export default function useElectivosDisponibles() {
  const [electivos, setElectivos] = useState([]);

  const fetchElectivos = async () => {
    const resp = await getElectivosValidados();
    if (resp?.status === "Client error") {
      showErrorAlert("Error", resp.details);
    } else {
      setElectivos(resp);
    }
  };

  useEffect(() => {
    fetchElectivos();
  }, []);

  return { electivos, fetchElectivos };
}
