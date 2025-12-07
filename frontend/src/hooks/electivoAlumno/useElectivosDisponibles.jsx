// src/hooks/electivoAlumno/useElectivosDisponibles.jsx
import { useEffect, useState, useCallback } from "react";
import { getElectivosValidados } from "@services/electivoLista.service.js";
import { showErrorAlert } from "@helpers/sweetAlert.js";

export default function useElectivosDisponibles() {
  const [electivos, setElectivos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchElectivos = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await getElectivosValidados();
      // resp: { status, message, data: [...] } or { status: "Client error", details: ... }
      if (resp?.status === "Success" && Array.isArray(resp.data)) {
        setElectivos(resp.data);
      } else {
        setElectivos([]);
        if (resp?.status !== "Success") {
          showErrorAlert("Error", resp?.details || resp?.message || "No se pudieron obtener electivos");
        }
      }
    } catch (err) {
      console.error("fetchElectivos error:", err);
      setElectivos([]);
      showErrorAlert("Error", "Error al obtener electivos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchElectivos();
  }, [fetchElectivos]);

  return { electivos, fetchElectivos, loading };
}
