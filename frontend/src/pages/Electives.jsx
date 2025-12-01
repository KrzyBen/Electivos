import React, { useEffect, useState } from "react";
import { getElectives } from "../services/elective.service";
import Table from "../components/Table";
import { Link } from "react-router-dom";

const Electives = () => {
  const [electives, setElectives] = useState([]);
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

  return (
    <div className="electives-page">
      <h2>Listado de Electivos</h2>
      {userRole === 'profesor' && (
        <Link to="/electives/new" className="btn">Agregar Electivo</Link>
      )}
      <Table
        data={electives}
        columns={[
          { title: "Título", field: "titulo" },
          { title: "Contenidos", field: "contenidos" },
          { title: "Cupo Máximo", field: "cupoMaximo" },
          { title: "Horario", field: "horario" },
        ]}
        actions={row => [
          <Link key="edit" to={`/electives/${row.id}/edit`} className="btn">Editar</Link>,
          <Link key="view" to={`/electives/${row.id}`} className="btn">Ver</Link>
        ]}
      />
    </div>
  );
};

export default Electives;
