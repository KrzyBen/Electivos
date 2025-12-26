import { useState, useEffect } from "react";
import { getUsers } from "@services/user.service";
import { getAllElectives } from "@services/elective.service";
import { specialRegistration } from "@services/registration.service";
import { showSuccessAlert, showErrorAlert } from "@helpers/sweetAlert";
import "@styles/form.css";

const InscripcionEspecial = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [electivos, setElectivos] = useState([]);
  const [selectedAlumno, setSelectedAlumno] = useState("");
  const [selectedElectivo, setSelectedElectivo] = useState("");
  const [activePeriodId, setActivePeriodId] = useState(null); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const usersResponse = await getUsers();
        if (Array.isArray(usersResponse)) {
          const filteredAlumnos = usersResponse.filter(
            (user) => user.rol === "Alumno"
          );
          setAlumnos(filteredAlumnos);
        }

        const electivesResponse = await getAllElectives();
        if (electivesResponse.status === "Success") {
          setElectivos(electivesResponse.data);
        }

        
        setActivePeriodId(1);
      } catch (error) {
        showErrorAlert("Error", "No se pudieron cargar los datos iniciales.");
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAlumno || !selectedElectivo || !activePeriodId) {
      showErrorAlert(
        "Error",
        "Debes seleccionar un alumno, un electivo y debe haber un período activo."
      );
      return;
    }

    const data = {
      studentId: selectedAlumno,
      electiveId: selectedElectivo,
      periodId: activePeriodId,
    };

    try {
      const response = await specialRegistration(data);
      if (response.status === "Success") {
        showSuccessAlert("¡Éxito!", "El alumno ha sido inscrito correctamente.");
        setSelectedAlumno("");
        setSelectedElectivo("");
      } else {
        showErrorAlert(
          "Error",
          response.details || "No se pudo realizar la inscripción."
        );
      }
    } catch (error) {
      showErrorAlert("Error", "Ocurrió un error en la inscripción.");
    }
  };

  return (
    <main className="container">
      <form className="form" onSubmit={handleSubmit}>
        <h1>Inscripción Especial</h1>
        <div className="container_inputs">
          <label htmlFor="alumno">Seleccionar Alumno</label>
          <select
            id="alumno"
            value={selectedAlumno}
            onChange={(e) => setSelectedAlumno(e.target.value)}
            required
          >
            <option value="">-- Elige un alumno --</option>
            {alumnos.map((alumno) => (
              <option key={alumno.id} value={alumno.id}>
                {alumno.nombreCompleto} ({alumno.rut})
              </option>
            ))}
          </select>
        </div>

        <div className="container_inputs">
          <label htmlFor="electivo">Seleccionar Electivo</label>
          <select
            id="electivo"
            value={selectedElectivo}
            onChange={(e) => setSelectedElectivo(e.target.value)}
            required
          >
            <option value="">-- Elige un electivo --</option>
            {electivos.map((electivo) => (
              <option key={electivo.id} value={electivo.id}>
                {electivo.titulo}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Inscribir Alumno</button>
      </form>
    </main>
  );
};

export default InscripcionEspecial;
