export function formatHorario(electivo) {
  if (!electivo?.horario) return "—";

  const date = new Date(electivo.horario + "T00:00:00");
  const dias = [
    "Domingo", "Lunes", "Martes",
    "Miércoles", "Jueves", "Viernes", "Sábado"
  ];

  const dia = dias[date.getDay()];
  const inicio = electivo.horaInicio?.slice(0, 5);
  const fin = electivo.horaFinal?.slice(0, 5);

  if (!inicio || !fin) return dia;

  return `${dia} ${inicio} – ${fin}`;
}
