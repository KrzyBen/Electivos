"use strict";

function getDiaSemana(fecha) {
  // acepta Date o string "YYYY-MM-DD"
  const date = fecha instanceof Date ? fecha : new Date(fecha + "T00:00:00");
  return date.getDay(); // 0 = domingo, 1 = lunes, ...
}

function toMinutes(time) {
  // acepta "HH:mm" o "HH:mm:ss"
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function hayConflictoHorario(a, b) {
  // mismo día de la semana
  const diaA = getDiaSemana(a.horario);
  const diaB = getDiaSemana(b.horario);

  if (diaA !== diaB) return false;

  // comparar solape de horas
  const inicioA = toMinutes(a.horaInicio);
  const finA = toMinutes(a.horaFinal);

  const inicioB = toMinutes(b.horaInicio);
  const finB = toMinutes(b.horaFinal);

  return inicioA < finB && inicioB < finA;
}