import { useEffect, useState } from "react";
import { getElectivosCarreraJefe } from "@services/jefeCarreraElectivos.service";

export default function useElectivosCarrera() {
  const [electivos, setElectivos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchElectivos = async () => {
    setLoading(true);
    const resp = await getElectivosCarreraJefe();
    if (Array.isArray(resp)) setElectivos(resp);
    setLoading(false);
  };

  useEffect(() => {
    fetchElectivos();
  }, []);

  return { electivos, loading };
}
