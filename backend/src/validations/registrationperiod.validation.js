"use strict";
import Joi from "joi";

export const periodValidation = Joi.object({
  nombre: Joi.string().min(5).max(255).required().messages({
    "string.empty": "El nombre del período no puede estar vacío.",
    "any.required": "El nombre del período es obligatorio.",
  }),
  fechaInicio: Joi.date().iso().required().messages({
    "date.base": "La fecha de inicio debe ser una fecha válida.",
    "any.required": "La fecha de inicio es obligatoria.",
  }),
  fechaTermino: Joi.date().iso().greater(Joi.ref('fechaInicio')).required().messages({
    "date.base": "La fecha de término debe ser una fecha válida.",
    "date.greater": "La fecha de término debe ser posterior a la fecha de inicio.",
    "any.required": "La fecha de término es obligatoria.",
  }),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});