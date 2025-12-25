import React, { useEffect, useState } from "react";
import { getAllElectives } from "../services/elective.service";
import ReactPaginate from "react-paginate";
import "../styles/electives.css";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

const JefeCarreraElectives = () => {
  const [electives, setElectives] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    getAllElectives()
      .then((data) => {
        setElectives(Array.isArray(data.data) ? data.data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar electivos");
        setLoading(false);
      });
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
              <div key={electivo.id} className="elective-card">
                <div className="card-header">
                  <h3>{electivo.titulo}</h3>
                </div>
                <div className="card-body">
                  <p><strong>Contenidos:</strong> {electivo.contenidos}</p>
                  <p><strong>Cupo Máximo:</strong> {electivo.cupoMaximo}</p>
                  <p><strong>Horario:</strong> {electivo.horario}</p>
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
    </ProtectedRoute>
  );
};

export default JefeCarreraElectives;
