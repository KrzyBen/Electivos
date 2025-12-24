import React, { useEffect, useState } from "react";
import { getElectives } from "../services/elective.service";
import ReactPaginate from "react-paginate";
import "../styles/electives.css";
import { Link } from "react-router-dom";

const Electives = () => {
  const [electives, setElectives] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getElectives()
      .then((data) => {
        setElectives(Array.isArray(data.data) ? data.data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error al cargar electivos");
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Cargando electivos...</div>;
  if (error) return <div>{error}</div>;

  const user = JSON.parse(sessionStorage.getItem("usuario") || "null");
  const userRole = user?.rol?.toLowerCase();

  const pageCount = Math.ceil(electives.length / itemsPerPage);
  const displayedElectives = electives.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className="electives-page">
      <h2>Listado de Electivos</h2>
      {userRole === "profesor" && (
        <Link to="/electives/new" className="btn add-elective-btn">
          Agregar Electivo
        </Link>
      )}
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
              <div className="card-footer">
                {userRole === "profesor" && (
                <Link to={`/electives/${electivo.id}/edit`} className="btn edit-btn">
                  Editar
                </Link>
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
  );
};

export default Electives;
