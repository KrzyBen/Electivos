import { useEffect, useState } from "react";
import { getMisElectivosAprobados } from "@services/electivoAprobado.service";

export default function useMisElectivosAprobados(periodId = null) {
  const [electivos, setElectivos] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchElectivos() {
    setLoading(true);
    const response = await getMisElectivosAprobados(periodId);

    if (Array.isArray(response)) {
      setElectivos(response);
    } else {
      setElectivos([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchElectivos();
  }, [periodId]);

  return {
    electivos,
    loading,
    fetchElectivos,
  };
}
