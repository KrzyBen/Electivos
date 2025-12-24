import React, { useState, useEffect } from "react";
import "../styles/electiveForm.css";
import { createElective, updateElective, getElectiveById } from "../services/elective.service";
import { useNavigate, useParams } from "react-router-dom";

const defaultValues = {
  titulo: "",
  contenidos: "",
  cupoMaximo: 40,
  horario: "",
  requisitos: ""
};

const ElectiveForm = ({ isEdit = false }) => {
  const [form, setForm] = useState(defaultValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      getElectiveById(id)
        .then(data => {
          const electivo = data.data || data;
          setForm({ ...defaultValues, ...electivo });
          setLoading(false);
        })
        .catch(() => {
          setError("Error al cargar electivo");
          setLoading(false);
        });
    }
  }, [isEdit, id]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formToSend = {
        titulo: form.titulo,
        contenidos: form.contenidos,
        cupoMaximo: Number(form.cupoMaximo),
        horario: new Date(form.horario),
        requisitos: form.requisitos
      };
      if (isEdit) {
        await updateElective(id, formToSend);
      } else {
        await createElective(formToSend);
      }
      navigate("/electives");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Error al guardar electivo");
      }
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <div className="elective-form"><h2>Cargando electivo...</h2></div>;
  }
  return (
    <form className="elective-form" onSubmit={handleSubmit}>
      <h2>{isEdit ? "Editar Electivo" : "Agregar Electivo"}</h2>
      {error && <div className="error">{error}</div>}
      <label>Título
        <input name="titulo" value={form.titulo} onChange={handleChange} required />
      </label>
      <label>Contenidos
        <textarea name="contenidos" value={form.contenidos} onChange={handleChange} required />
      </label>
      <label>Cupo Máximo
        <input name="cupoMaximo" type="number" value={form.cupoMaximo} onChange={handleChange} required />
      </label>
      <label>Horario
        <input
          name="horario"
          type="datetime-local"
          value={form.horario}
          onChange={handleChange}
          required
        />
      </label>
      <label>Requisitos
        <input name="requisitos" value={form.requisitos} onChange={handleChange} />
      </label>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</button>
        {isEdit && (
          <button type="button" className="cancel-btn" onClick={() => navigate('/electives')}>Cancelar</button>
        )}
      </div>
    </form>
  );
};

export default ElectiveForm;
