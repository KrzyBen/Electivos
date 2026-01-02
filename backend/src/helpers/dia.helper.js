"use strict";

const formatDayOfWeek = (value) => {
  if (!value) return "—";

  const date =
    value instanceof Date ? value : new Date(value + "T00:00:00");

  if (isNaN(date.getTime())) return "—";

  const dias = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];

  return dias[date.getDay()];
};

export default formatDayOfWeek;