//src/hooks/jefeCarrera/useAlumnosCarrera.jsx
import { useEffect, useState } from "react";
import { getAlumnosCarrera } from "@services/jefeCarreraElectivos.service";

export default function useAlumnosCarrera() {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlumnos = async () => {
    setLoading(true);
    const alumnosData = await getAlumnosCarrera();
    setAlumnos(alumnosData || []);
    setLoading(false);
  };


  useEffect(() => {
    fetchAlumnos();
  }, []);

  return { alumnos, loading };
}
