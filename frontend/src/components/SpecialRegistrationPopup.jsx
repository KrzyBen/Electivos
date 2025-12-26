import { useState, useEffect } from 'react';
import { getAllPeriods } from '@services/periodo.service';
import { specialRegistration } from '@services/registration.service';
import { showSuccessAlert, showErrorAlert } from '@helpers/sweetAlert';
import '@styles/al-popup.css';

export default function SpecialRegistrationPopup({ show, onClose, student }) {
  const [periods, setPeriods] = useState([]);
  const [availableElectives, setAvailableElectives] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [selectedElectiveId, setSelectedElectiveId] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar todos los períodos cuando se muestra el popup
  useEffect(() => {
    if (show) {
      setLoading(true);
      getAllPeriods()
        .then((res) => {
          if (res.status === 'Success') {
            setPeriods(res.data);
          } else {
            setPeriods([]);
            showErrorAlert('Error', 'No se pudieron cargar los períodos.');
          }
        })
        .catch(() => {
          showErrorAlert('Error', 'No se pudieron cargar los datos para la inscripción.');
          onClose();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      
      setPeriods([]);
      setAvailableElectives([]);
      setSelectedPeriodId('');
      setSelectedElectiveId('');
    }
  }, [show, onClose]);

  // Cuando el período seleccionado cambia, actualizar la lista de electivos disponibles
  useEffect(() => {
    if (selectedPeriodId) {
      const selectedPeriod = periods.find(p => p.id === Number(selectedPeriodId));
      setAvailableElectives(selectedPeriod?.electives || []);
      setSelectedElectiveId(''); 
    } else {
      setAvailableElectives([]);
    }
  }, [selectedPeriodId, periods]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedElectiveId || !selectedPeriodId) {
      showErrorAlert('Error', 'Debe seleccionar un electivo y un período.');
      return;
    }

    const data = {
      studentId: student.id,
      electiveId: Number(selectedElectiveId),
      periodId: Number(selectedPeriodId),
    };

    try {
      const response = await specialRegistration(data);
      if (response.status === 'Success') {
        showSuccessAlert('¡Éxito!', `El alumno ${student.nombreCompleto} ha sido inscrito.`);
        onClose();
      } else {
        showErrorAlert('Error', response.details || 'No se pudo realizar la inscripción.');
      }
    } catch (error) {
      showErrorAlert('Error', 'Ocurrió un error en la inscripción.');
    }
  };

  if (!show) return null;

  return (
    <div className="al-popup-overlay">
      <div className="al-popup-box" style={{ maxWidth: '500px' }}>
        <button className="al-popup-close" onClick={onClose}>×</button>
        <h2 className="al-popup-title">Inscripción Especial</h2>
        <p style={{ textAlign: 'center', marginBottom: '20px' }}>
          Inscribiendo a: <strong>{student.nombreCompleto}</strong>
        </p>

        {loading ? <p>Cargando...</p> : (
          <form onSubmit={handleSubmit} className="al-popup-form">
            <label htmlFor="periodo" className="al-popup-label">Período de Inscripción</label>
            <select
              id="periodo"
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              required
              className="al-popup-input"
            >
              <option value="">-- Elige un período --</option>
              {periods.map((period) => (
                <option key={period.id} value={period.id}>{period.nombre}</option>
              ))}
            </select>

            <label htmlFor="electivo" className="al-popup-label">Electivo</label>
            <select
              id="electivo"
              value={selectedElectiveId}
              onChange={(e) => setSelectedElectiveId(e.target.value)}
              required
              disabled={!selectedPeriodId || availableElectives.length === 0}
              className="al-popup-input"
            >
              <option value="">-- Elige un electivo --</option>
              {availableElectives.map((elective) => (
                <option key={elective.id} value={elective.id}>{elective.titulo}</option>
              ))}
            </select>

            <div className="al-popup-actions">
              <button type="submit" className="al-btn-confirm" disabled={!selectedElectiveId}>Inscribir</button>
              <button type="button" className="al-btn-cancel" onClick={onClose}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}