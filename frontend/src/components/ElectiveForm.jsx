import React, { useState, useEffect } from "react";
import "../styles/electiveForm.css";
import {
  createElective,
  updateElective,
  getElectiveById,
} from "../services/elective.service";
import { useNavigate, useParams } from "react-router-dom";

const defaultValues = {
  titulo: "",
  contenidos: "",
  cupoMaximo: 40,
  horario: "",
  horaInicio: "",
  horaFinal: "",
  requisitos: "",
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
        .then((data) => {
          const electivo = data.data || data;
          setForm({ ...defaultValues, ...electivo });
        })
        .catch(() => setError("Error al cargar electivo"))
        .finally(() => setLoading(false));
    }
  }, [isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formToSend = {
      titulo: form.titulo,
      contenidos: form.contenidos,
      cupoMaximo: Number(form.cupoMaximo),
      horario: form.horario,
      horaInicio: form.horaInicio,
      horaFinal: form.horaFinal,
      requisitos: form.requisitos,
    };

    try {
      isEdit
        ? await updateElective(id, formToSend)
        : await createElective(formToSend);
      navigate("/electives");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Error al guardar electivo"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="elective-form">Cargando...</div>;

  return (
    <form className="elective-form" onSubmit={handleSubmit}>
      <h2>{isEdit ? "Editar Electivo" : "Agregar Electivo"}</h2>

      {error && <div className="error">{error}</div>}

      <label>
        Título
        <input name="titulo" value={form.titulo} onChange={handleChange} required />
      </label>

      <label>
        Contenidos
        <textarea
          name="contenidos"
          value={form.contenidos}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Cupo Máximo
        <input
          type="number"
          name="cupoMaximo"
          min={1}
          max={40}
          value={form.cupoMaximo}
          onChange={handleChange}
          required
        />
      </label>


      <label>
        Horario (fecha)
        <input
          type="date"
          name="horario"
          value={form.horario ? new Date(form.horario).toISOString().split('T')[0] : ""}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Hora de inicio
        <input
          type="time"
          name="horaInicio"
          value={form.horaInicio}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Hora final
        <input
          type="time"
          name="horaFinal"
          value={form.horaFinal}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Requisitos
        <input
          name="requisitos"
          value={form.requisitos}
          onChange={handleChange}
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
};

export default ElectiveForm;