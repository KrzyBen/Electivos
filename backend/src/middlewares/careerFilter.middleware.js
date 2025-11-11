"use strict";
import { handleErrorClient } from "../handlers/responseHandlers.js";

// Middleware that attaches a reusable career filter to the request.
// - sets `req.careerFilter = { careerName, careerEntidadId }`
// - sets `req.applyCareerFilter = true|false` depending on role and optional query override
// Usage: place after `authenticateJwt` so `req.user` is available.
export function attachCareerFilter(req, res, next) {
  try {
    const user = req.user;
    if (!user) return handleErrorClient(res, 401, "Usuario no autenticado");

    const careerName = user.carrera || null;
    const careerEntidadId = user.carreraEntidad ? user.carreraEntidad.id : null;

    req.careerFilter = { careerName, careerEntidadId };

    // Por defecto aplicamos filtro a JefeCarrera y Alumno. Profesores y administradores no se restringen.
    const role = user.rol || "";
    let apply = role === "JefeCarrera" || role === "Alumno";

    // Allow override from query: scope=all disables the career filter (useful for admins/tests)
    if (req.query && String(req.query.scope).toLowerCase() === "all") apply = false;

    req.applyCareerFilter = apply;

    next();
  } catch (error) {
    next(error);
  }
}

export default attachCareerFilter;
