"use strict";
import Joi from "joi";

export const createElectivoListaSchema = Joi.object({
  electivoId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "any.required": "El ID del electivo es obligatorio.",
      "number.base": "El ID del electivo debe ser un número.",
      "number.integer": "El ID del electivo debe ser un número entero.",
      "number.positive": "El ID del electivo debe ser un número positivo.",
    }),

  posicion: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      "number.base": "La posición debe ser un número.",
      "number.integer": "La posición debe ser un número entero.",
      "number.positive": "La posición debe ser un número positivo.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales en el cuerpo.",
  });

export const updateElectivoListaSchema = Joi.object({
  electivoId: Joi.number().integer().positive().optional(),
  posicion: Joi.number().integer().positive().optional(),
}).messages({
  "object.unknown": "No se permiten propiedades adicionales en el cuerpo.",
});

export const idParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "any.required": "El parámetro ID es obligatorio.",
      "number.base": "El ID debe ser un número.",
      "number.integer": "El ID debe ser un número entero.",
      "number.positive": "El ID debe ser un número positivo.",
    }),
});