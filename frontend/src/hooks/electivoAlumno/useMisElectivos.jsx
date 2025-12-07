// src/hooks/electivoAlumno/useMisElectivos.jsx
import { useState, useEffect, useCallback } from "react";
import { getMisElectivos } from "@services/electivoLista.service";

export default function useMisElectivos() {
  const [misElectivos, setMisElectivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMisElectivos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await getMisElectivos();
      let items = [];

      const originalItems = resp?.items || (Array.isArray(resp) ? resp : []);

      items = originalItems.map((item) => ({
        listaId: item.id,
        prioridad: item.posicion,
        estado: item.estado,
        electivoId: item.electivo?.id,
        nombre: item.electivo?.titulo,
        horario: item.electivo?.horario,
        profesor: item.electivo?.profesor?.nombreCompleto ?? "—",
        cupoMaximo: item.electivo?.cupoMaximo,
        cupoDisponible: item.electivo?.cupoDisponible,
        electivo: item.electivo,
      }));


      setMisElectivos(items);
    } catch (err) {
      console.error("Error fetching mis electivos:", err);
      setError(err?.details || "Error al obtener electivos");
      setMisElectivos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMisElectivos();
  }, [fetchMisElectivos]);

  return { misElectivos, fetchMisElectivos, loading, error, setMisElectivos };
}