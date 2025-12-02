// Validación para actualización de electivo (PUT)

"use strict";
import Joi from "joi";

export const electiveValidation = Joi.object({
  titulo: Joi.string().min(5).max(255).required().messages({
    "string.empty": "El título no puede estar vacío.",
    "any.required": "El título es obligatorio.",
  }),
  contenidos: Joi.string().min(10).required().messages({
    "string.empty": "Los contenidos no pueden estar vacíos.",
    "any.required": "Los contenidos son obligatorios.",
  }),
  cupoMaximo: Joi.number().integer().min(1).max(45).required().messages({
    "number.base": "El cupo debe ser un número.",
    "number.min": "El cupo mínimo es 1.",
    "number.max": "El cupo máximo permitido es 45.",
    "any.required": "El cupo es obligatorio.",
  }),
  horario: Joi.date().required().messages({
    "date.base": "El horario debe ser una fecha válida.",
    "any.required": "El horario es obligatorio.",
  }),
  requisitos: Joi.string().allow(null, "").max(2000).messages({
    "string.max": "Los requisitos pueden tener hasta 2000 caracteres.",
  }),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});

export const electiveUpdateValidation = Joi.object({
  titulo: Joi.string().min(5).max(255).required().messages({
    "string.empty": "El título no puede estar vacío.",
    "any.required": "El título es obligatorio.",
  }),
  contenidos: Joi.string().min(10).required().messages({
    "string.empty": "Los contenidos no pueden estar vacíos.",
    "any.required": "Los contenidos son obligatorios.",
  }),
  cupoMaximo: Joi.number().integer().min(1).max(45).required().messages({
    "number.base": "El cupo debe ser un número.",
    "number.min": "El cupo mínimo es 1.",
    "number.max": "El cupo máximo permitido es 45.",
    "any.required": "El cupo es obligatorio.",
  }),
  horario: Joi.string().min(5).max(255).required().messages({
    "string.empty": "El horario no puede estar vacío.",
    "any.required": "El horario es obligatorio.",
  }),
  requisitos: Joi.string().allow(null, "").max(2000).messages({
    "string.max": "Los requisitos pueden tener hasta 2000 caracteres.",
  }),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});