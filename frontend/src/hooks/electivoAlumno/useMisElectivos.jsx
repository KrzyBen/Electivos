import { useEffect, useState } from "react";
import { getMisElectivos } from "@services/electivoLista.service.js";
import { showErrorAlert } from "@helpers/sweetAlert.js";

export default function useMisElectivos() {
  const [misElectivos, setMisElectivos] = useState([]);

  const fetchMisElectivos = async () => {
    const resp = await getMisElectivos();
    if (resp?.status === "Client error") {
      showErrorAlert("Error", resp.details);
    } else {
      setMisElectivos(resp);
    }
  };

  useEffect(() => {
    fetchMisElectivos();
  }, []);

  return { misElectivos, setMisElectivos, fetchMisElectivos };
}
