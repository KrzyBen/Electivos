export default function ElectivoAprobadoCard({ item }) {
  const { electivo } = item;

  return (
    <div className="aea-electivo-card">
      <h4 className="aea-electivo-title">{electivo.titulo}</h4>

      <div className="aea-electivo-section">
        <p className="aea-electivo-text"><strong>Horario:</strong> {new Date(electivo.horario).toLocaleDateString()}</p>
        <p className="aea-electivo-text"><strong>Hora:</strong> {electivo.horaInicio} – {electivo.horaFinal}</p>
      </div>

      <p className="estado-aprobado">Electivo aprobado</p>
    </div>
  );
}
