import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getAllPeriods, addElectivesToPeriod, createPeriod, deletePeriod } from '@services/registrationperiod.service';
import { getAllElectives } from '@services/elective.service';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert';
import Table from '@components/Table';
import '@styles/al-popup.css';
import '@styles/popup.css';

//Popup de Asignación 
function AssignPopup({ show, period, allElectives, onClose, onSave }) {
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    setSelectedIds(new Set(period?.electives?.map(e => e.id) || []));
  }, [period]);

  const handleToggle = (electiveId) => {
    const newSelectedIds = new Set(selectedIds);
    newSelectedIds.has(electiveId) ? newSelectedIds.delete(electiveId) : newSelectedIds.add(electiveId);
    setSelectedIds(newSelectedIds);
  };

  const handleSaveChanges = async () => {
    const finalIds = Array.from(selectedIds);
    const comments = {};

    
    const unselectedElectives = allElectives.filter(elective => !selectedIds.has(elective.id));

    for (const elective of unselectedElectives) {
      const { value: comment, isConfirmed } = await Swal.fire({
        title: `Motivo de no asignación`,
        html: `Por favor, indica por qué el electivo <strong>"${elective.titulo}"</strong> no fue asignado al período.`,
        input: 'textarea',
        inputPlaceholder: 'Ej: El electivo no cumple con los requisitos...',
        showCancelButton: true,
        confirmButtonText: 'Confirmar motivo',
        cancelButtonText: 'Cancelar guardado',
        inputValidator: (value) => !value && 'Debes ingresar un motivo para continuar.'
      });

      if (!isConfirmed) {
        showErrorAlert("Cancelado", "La operación de guardado ha sido cancelada.");
        return; 
      }
      comments[elective.id] = comment;
    }

    
    onSave(period.id, finalIds, comments);
  };

  if (!show) return null;

  return (
    <div className="al-popup-overlay">
      <div className="al-popup-box" style={{ maxWidth: '600px' }}>
        <button className="al-popup-close" onClick={onClose}>×</button>
        <h2 className="al-popup-title">Asignar Electivos a "{period?.nombre}"</h2>
        <div className="al-electivos-list" style={{ maxHeight: '400px' }}>
          {allElectives.map(elective => (
            <div key={elective.id} className={`al-electivo-card ${selectedIds.has(elective.id) ? 'selected' : ''}`} onClick={() => handleToggle(elective.id)}>
              <h3>{elective.titulo}</h3>
              <p><strong>Profesor:</strong> {elective.profesor?.nombreCompleto || 'No asignado'}</p>
              <p><strong>Horario:</strong> {elective.horario}</p>
            </div>
          ))}
        </div>
        <div className="al-popup-actions">
          <button className="al-btn-confirm" onClick={handleSaveChanges}>Guardar Cambios</button>
          <button className="al-btn-cancel" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// Popup para Crear Período 
function CreatePeriodPopup({ show, onClose, onSave }) {
  const [nombre, setNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaTermino, setFechaTermino] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre || !fechaInicio || !fechaTermino) {
      showErrorAlert('Error', 'Todos los campos son obligatorios.');
      return;
    }
    onSave({ nombre, fechaInicio, fechaTermino });
  };

  if (!show) return null;

  return (
    <div className="bg">
      <div className="popup" style={{ height: 'auto' }}>
        <button className='close' onClick={onClose}>&times;</button>
        <form className="form" onSubmit={handleSubmit} style={{ backgroundColor: '#fff' }}>
          <h1>Crear Nuevo Período</h1>
          <div className="container_inputs">
            <label htmlFor="nombre">Nombre del Período</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Período 2025-1"
              required
            />
          </div>
          <div className="container_inputs">
            <label htmlFor="fechaInicio">Fecha de Inicio</label>
            <input
              id="fechaInicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
            />
          </div>
          <div className="container_inputs">
            <label htmlFor="fechaTermino">Fecha de Término</label>
            <input
              id="fechaTermino"
              type="date"
              value={fechaTermino}
              onChange={(e) => setFechaTermino(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="button">
            Crear Período
          </button>
        </form>
      </div>
    </div>
  );
}

// Popup para Crear Período 
const GestionPeriodos = () => {
    const [periods, setPeriods] = useState([]);
    const [allElectives, setAllElectives] = useState([]);
    const [isAssignPopupOpen, setAssignPopupOpen] = useState(false);
    const [isCreatePopupOpen, setCreatePopupOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState(null);

    const fetchPeriods = async () => {
        const response = await getAllPeriods();
        if (response.status === 'Success') setPeriods(response.data);
    };

    useEffect(() => { fetchPeriods(); }, []);

    const handleOpenAssignPopup = async (period) => {
        const response = await getAllElectives();
        if (response.status === 'Success') setAllElectives(response.data);
        setSelectedPeriod(period);
        setAssignPopupOpen(true);
    };

    const handleSaveElectives = async (periodId, electiveIds, comments) => {
        const response = await addElectivesToPeriod(periodId, { electiveIds, comments });
        if (response.status === 'Success') {
            showSuccessAlert('Éxito', 'Los electivos del período han sido actualizados.');
            fetchPeriods();
            setAssignPopupOpen(false);
        } else {
            showErrorAlert('Error', response.details || 'No se pudieron guardar los cambios.');
        }
    };

  const handleDeletePeriod = async (period) => {
    const result = await Swal.fire({
      title: 'Eliminar período',
      text: `¿Deseas eliminar el período "${period.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    const response = await deletePeriod(period.id);
    if (response.status === 'Success') {
      showSuccessAlert('Eliminado', 'El período ha sido eliminado.');
      fetchPeriods();
    } else {
      showErrorAlert('Error', response.details || 'No se pudo eliminar el período.');
    }
  };

    
    const handleCreatePeriod = async (data) => {
        
        const dataToSend = {
            ...data,
            fechaInicio: `${data.fechaInicio}T00:00:00.000Z`,
            fechaTermino: `${data.fechaTermino}T00:00:00.000Z`,
        };

        const response = await createPeriod(dataToSend);
        if (response.status === 'Success') {
            showSuccessAlert('Éxito', 'El nuevo período ha sido creado.');
            fetchPeriods();
            setCreatePopupOpen(false);
        } else {
            
            showErrorAlert('Error', response.details || 'No se pudo crear el período.');
        }
    };

    const columns = [
        { title: "Nombre", field: "nombre" },
        { title: "Fecha Inicio", field: "fechaInicio" },
        { title: "Fecha Término", field: "fechaTermino" },
        {
            title: "Asignar Electivos", hozAlign: "center", headerSort: false,
            formatter: () => `<button class="al-btn-replace" style="padding:4px 8px;">Asignar</button>`,
            cellClick: (e, cell) => handleOpenAssignPopup(cell.getRow().getData()),
        },
    {
      title: "Eliminar", hozAlign: "center", headerSort: false,
      formatter: () => `<button class="al-btn-cancel" style="padding:4px 8px;">Eliminar</button>`,
      cellClick: (e, cell) => handleDeletePeriod(cell.getRow().getData()),
    },
    ];

    return (
        <div className="al-main-container">
            <div className="al-table-container">
                <div className="al-top-table">
                    <h1 className="al-title-table">Gestión de Períodos de Inscripción</h1>
                    <div className="al-actions">
                        <button onClick={() => setCreatePopupOpen(true)} className="al-btn-replace">
                            Crear Período
                        </button>
                    </div>
                </div>
                <Table data={periods} columns={columns} onSelectionChange={() => {}} dataToFilter="nombre" initialSortName="fechaInicio" />
            </div>

            {isAssignPopupOpen && <AssignPopup show={isAssignPopupOpen} period={selectedPeriod} allElectives={allElectives} onClose={() => setAssignPopupOpen(false)} onSave={handleSaveElectives} />}
            {isCreatePopupOpen && <CreatePeriodPopup show={isCreatePopupOpen} onClose={() => setCreatePopupOpen(false)} onSave={handleCreatePeriod} />}
        </div>
    );
};

export default GestionPeriodos;