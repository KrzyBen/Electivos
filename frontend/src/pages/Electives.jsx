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
        // data.data es el array de electivos
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

  const user = JSON.parse(sessionStorage.getItem('usuario')) || '';
  const userRole = user?.rol;

  // Paginación
  const pageCount = Math.ceil(electives.length / itemsPerPage);
  const displayedElectives = electives.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className="electives-page">
      <h2>Listado de Electivos</h2>
      {userRole === 'profesor' && (
        <Link to="/electives/new" className="btn">Agregar Electivo</Link>
      )}
      <div className="electives-grid">
        {displayedElectives.map(electivo => (
          <div key={electivo.id} className="elective-card">
            <h3>{electivo.titulo}</h3>
            <p><strong>Contenidos:</strong> {electivo.contenidos}</p>
            <p><strong>Cupo Máximo:</strong> {electivo.cupoMaximo}</p>
            <p><strong>Horario:</strong> {electivo.horario}</p>
            <div className="card-actions">
              {userRole === 'profesor' && (
                <Link to={`/electives/${electivo.id}/edit`} className="btn">Editar</Link>
              )}
              <Link to={`/electives/${electivo.id}`} className="btn">Ver</Link>
            </div>
          </div>
        ))}
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
