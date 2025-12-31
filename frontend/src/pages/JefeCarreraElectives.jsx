import React, { useEffect, useState } from "react";
// Utilidad para mostrar el día de la semana
const getDiaSemana = (fechaStr) => {
  if (!fechaStr) return '';
  const fecha = new Date(fechaStr);
  if (isNaN(fecha)) return '';
  const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return dias[fecha.getDay()];
};
import { getAllElectives, validateElective, deleteElective } from "../services/elective.service";
import ReactPaginate from "react-paginate";
import "../styles/electives.css";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import ConfirmationPopup from "../components/ConfirmationPopup";

const JefeCarreraElectives = () => {
  const [electives, setElectives] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [electiveToDelete, setElectiveToDelete] = useState(null);

  const fetchElectives = () => {
    setLoading(true);
    getAllElectives()
      .then((data) => {
        setElectives(Array.isArray(data.data) ? data.data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar electivos");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchElectives();
  }, []);

  if (loading) return <div>Cargando electivos...</div>;
  if (error) return <div>{error}</div>;

  const pageCount = Math.ceil(electives.length / itemsPerPage);
  const displayedElectives = electives.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <ProtectedRoute allowedRoles={["administrador"]}>
      <div className="electives-page">
        <h2>Electivos - Jefe de Carrera</h2>
        <div className="cards-container">
          {displayedElectives.length === 0 ? (
            <div className="no-electives">No hay electivos disponibles.</div>
          ) : (
            displayedElectives.map(electivo => (
              <div
                key={electivo.id}
                className="elective-card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/electives/${electivo.id}`)}
              >
                <div className="card-header">
                  <h3>{electivo.titulo}</h3>
                </div>
                <div className="card-body">
                  <p><strong>Contenidos:</strong> {electivo.contenidos}</p>
                  <p><strong>Cupo Máximo:</strong> {electivo.cupoMaximo}</p>
                  <p><strong>Horario:</strong> {getDiaSemana(electivo.horario)}</p>
                  <p><strong>Aceptado:</strong> <span className={electivo.validado ? "estado-validado" : "estado-no-validado"}>{electivo.validado ? "Sí" : "No"}</span></p>
                  <p><strong>Cupo disponible:</strong> {electivo.cupoDisponible}</p>
                </div>
                <div className="card-actions">
                  {!electivo.validado && (
                    <>
                      <button
                        className="btn-validar"
                        onClick={async e => {
                          e.stopPropagation();
                          try {
                            await validateElective(electivo.id);
                            fetchElectives();
                          } catch (err) {
                            alert('Error al validar electivo');
                          }
                        }}
                      >
                        Validar
                      </button>
                      <button
                        className="btn-eliminar"
                        onClick={e => {
                          e.stopPropagation();
                          setElectiveToDelete(electivo.id);
                          setShowConfirm(true);
                        }}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <ReactPaginate
          previousLabel={"Anterior"}
          nextLabel={"Siguiente"}
          breakLabel={"..."}
          pageCount={pageCount}
          marginPagesDisplayed={1}
          pageRangeDisplayed={2}
          onPageChange={({ selected }) => setCurrentPage(selected)}
          containerClassName={"pagination"}
          activeClassName={"active"}
        />
      </div>
      <ConfirmationPopup
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={async () => {
          try {
            await deleteElective(electiveToDelete);
            setShowConfirm(false);
            setElectiveToDelete(null);
            fetchElectives();
          } catch (err) {
            alert('Error al eliminar electivo');
          }
        }}
        message="¿Estás seguro que deseas eliminar este electivo?"
      />
    </ProtectedRoute>
  );
};

export default JefeCarreraElectives;
