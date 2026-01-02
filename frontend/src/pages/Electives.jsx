import React, { useEffect, useState } from "react";
import { getElectives } from "../services/elective.service";
import ReactPaginate from "react-paginate";
import "../styles/electives.css";

const buttonStyle = {
  background: 'linear-gradient(90deg, #0055a5 0%, #003366 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '0.5rem 1.3rem',
  cursor: 'pointer',
  textDecoration: 'none',
  fontSize: '1.08rem',
  fontWeight: 600,
  boxShadow: '0 2px 8px rgba(0,85,165,0.10)',
  letterSpacing: '0.5px',
  transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
  outline: 'none',
  display: 'inline-block',
};
const buttonHoverStyle = {
  background: 'linear-gradient(90deg, #003366 0%, #0055a5 100%)',
  transform: 'translateY(-2px) scale(1.04)',
  boxShadow: '0 4px 16px rgba(0,85,165,0.18)',
};
import { Link, useNavigate } from "react-router-dom";

const Electives = () => {
  const [electives, setElectives] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
  const userRole = user?.rol;

  const pageCount = Math.ceil(electives.length / itemsPerPage);
  const displayedElectives = electives.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className="electives-page">
      <h2>Listado de Electivos</h2>
      {userRole === "Profesor" && (
        <Link
          to="/electives/new"
          className="btn add-elective-btn"
          style={buttonStyle}
          onMouseOver={e => Object.assign(e.target.style, buttonHoverStyle)}
          onMouseOut={e => Object.assign(e.target.style, buttonStyle)}
        >
          Agregar Electivo
        </Link>
      )}
      <div className="cards-container">
        {displayedElectives.length === 0 ? (
          <div className="no-electives">No hay electivos disponibles.</div>
        ) : (
          displayedElectives.map(electivo => (
            <div
              key={electivo.id}
              className="elective-card"
              style={{ cursor: 'pointer' }}
              onClick={e => {
                if (e.target.closest('.edit-btn')) return;
                navigate(`/electives/${electivo.id}`);
              }}
            >
              <div className="card-header">
                <h3>{electivo.titulo}</h3>
              </div>
              <div className="card-body">
                <p><strong>Contenidos:</strong> {electivo.contenidos}</p>
                <p><strong>Cupo Máximo:</strong> {electivo.cupoMaximo}</p>
                <p><strong>Cupos:</strong> {electivo.cupoDisponible} / {electivo.cupoMaximo}</p>
              </div>
              <div className="card-footer">
                {userRole === "Profesor" && !electivo.validado && (
                  <Link
                    to={`/electives/${electivo.id}/edit`}
                    className="btn edit-btn"
                    style={buttonStyle}
                    onMouseOver={e => Object.assign(e.target.style, buttonHoverStyle)}
                    onMouseOut={e => Object.assign(e.target.style, buttonStyle)}
                    onClick={e => e.stopPropagation()}
                  >
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
