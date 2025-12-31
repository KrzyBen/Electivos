import Table from '@components/Table'
import useUsers from '@hooks/users/useGetUsers.jsx'
import Search from '../components/Search'
import Popup from '../components/Popup'
import SpecialRegistrationPopup from '@components/SpecialRegistrationPopup'
import DeleteIcon from '../assets/deleteIcon.svg'
import UpdateIcon from '../assets/updateIcon.svg'
import UpdateIconDisable from '../assets/updateIconDisabled.svg'
import DeleteIconDisable from '../assets/deleteIconDisabled.svg'
import { useCallback, useState, useEffect } from 'react'
import '@styles/users.css'
import '@styles/al-popup.css'
import useEditUser from '@hooks/users/useEditUser'
import useDeleteUser from '@hooks/users/useDeleteUser'
import { getRegistrationsByStudent, unenrollStudent } from '@services/registration.service';
import { showSuccessAlert, showErrorAlert } from "@helpers/sweetAlert";


const ViewUserPopup = ({ show, user, onClose, onOpenSpecialReg }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRegistrations = () => {
    if (show && user?.rol === 'Alumno') {
      setLoading(true);
      getRegistrationsByStudent(user.id)
        .then(response => {
          if (response.status === 'Success') {
            setRegistrations(response.data);
          } else {
            setRegistrations([]);
          }
        })
        .catch(() => setRegistrations([]))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [show, user]);

  // Función para manejar la desinscripción
  const handleUnenroll = async (registrationId) => {
    const response = await unenrollStudent(registrationId);
    if (response.status === 'Success') {
      showSuccessAlert('¡Éxito!', 'El alumno ha sido desinscrito.');
      fetchRegistrations(); 
    } else {
      showErrorAlert('Error', response.details || 'No se pudo completar la acción.');
    }
  };

  if (!show) return null;

  return (
    <div className="al-popup-overlay">
      <div className="al-popup-box" style={{ maxWidth: "600px" }}>
        <button className="al-popup-close" onClick={onClose}>×</button>
        <h2 className="al-popup-title">Detalles del Usuario</h2>
        
        <div style={{ marginBottom: '20px', lineHeight: '1.6', textAlign: 'left' }}>
          <p><strong>Nombre:</strong> {user.nombreCompleto}</p>
          <p><strong>RUT:</strong> {user.rut}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Rol:</strong> {user.rol}</p>
        </div>

        {user.rol === 'Alumno' && (
          <>
            <h3 style={{ color: '#003366', borderBottom: '1px solid #ccc', paddingBottom: '5px', textAlign: 'left' }}>Inscripciones Realizadas</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '20px', textAlign: 'left' }}>
              {loading ? <p>Cargando inscripciones...</p> : (
                registrations.length > 0 ? (
                  <ul>
                    
                    {registrations.map(reg => (
                      <li key={reg.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 4px', borderBottom: '1px solid #eee' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>
                            <strong>{reg.elective.titulo}</strong>
                          </span>
                          <span style={{ fontSize: '12px', color: '#555' }}>
                            Período: {reg.period.nombre} | Horario: {reg.elective.horario}
                          </span>
                        </div>
                        <button onClick={() => handleUnenroll(reg.id)} className="al-btn-cancel" style={{padding: '2px 8px', fontSize: '12px', marginLeft: '10px'}}>
                          Desinscribir
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Este alumno no tiene inscripciones registradas.</p>
                )
              )}
            </div>
          </>
        )}

        <div className="al-popup-actions">
          {user.rol === 'Alumno' && (
            <button onClick={onOpenSpecialReg} className="al-btn-confirm">
              Inscripción Especial
            </button>
          )}
          <button onClick={onClose} className="al-btn-cancel">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};


const Users = () => {
  const { users, fetchUsers, setUsers } = useUsers()
  const [filterRut, setFilterRut] = useState('')

  const {
    handleClickUpdate,
    handleUpdate,
    isPopupOpen,
    setIsPopupOpen,
    dataUser,
    setDataUser
  } = useEditUser(setUsers, fetchUsers)

  const { handleDelete } = useDeleteUser(fetchUsers, setDataUser)

  // Estados para los popups
  const [isViewPopupOpen, setViewPopupOpen] = useState(false);
  const [isSpecialRegOpen, setSpecialRegOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleOpenViewPopup = (user) => {
    setSelectedUser(user);
    setViewPopupOpen(true);
  };

  const handleOpenSpecialReg = () => {
    setViewPopupOpen(false);
    setSpecialRegOpen(true);  
  };

  const handleRutFilterChange = (e) => {
    setFilterRut(e.target.value)
  }

  const handleSelectionChange = useCallback((selectedUsers) => {
    setDataUser(selectedUsers)
  }, [setDataUser])

  const columns = [
    { title: 'Nombre', field: 'nombreCompleto', width: 350, responsive: 0 },
    { title: 'Correo electrónico', field: 'email', width: 300, responsive: 3 },
    { title: 'Rut', field: 'rut', width: 150, responsive: 2 },
    { title: 'Rol', field: 'rol', width: 200, responsive: 2 },
    { title: 'Carrera', field: 'carrera', width: 200, responsive: 2 },
    {
      title: "Acciones",
      field: "acciones",
      headerSort: false,
      formatter: (cell) => {
        const user = cell.getRow().getData();
        const button = document.createElement("button");
        button.innerText = "Ver";
        button.className = "al-btn-replace"; 
        button.style.padding = "4px 8px";
        button.onclick = () => handleOpenViewPopup(user);
        return button;
      },
    },
  ]

  return (
    <div className='main-container'>
      <div className='table-container'>
        <div className='top-table'>
          <h1 className='title-table'>Usuarios</h1>
          <div className='filter-actions'>
            <Search value={filterRut} onChange={handleRutFilterChange} placeholder='Filtrar por rut' />
            <button onClick={handleClickUpdate} disabled={dataUser.length === 0}>
              {dataUser.length === 0
                ? <img src={UpdateIconDisable} alt='edit-disabled' />
                : <img src={UpdateIcon} alt='edit' />
              }
            </button>
            <button className='delete-user-button' disabled={dataUser.length === 0} onClick={() => handleDelete(dataUser)}>
              {dataUser.length === 0
                ? <img src={DeleteIconDisable} alt='delete-disabled' />
                : <img src={DeleteIcon} alt='delete' />
              }
            </button>
          </div>
        </div>
        <Table
          data={users}
          columns={columns}
          filter={filterRut}
          dataToFilter='rut'
          initialSortName='nombreCompleto'
          onSelectionChange={handleSelectionChange}
        />
      </div>
      <Popup show={isPopupOpen} setShow={setIsPopupOpen} data={dataUser} action={handleUpdate} />
      
      {selectedUser && (
        <ViewUserPopup
          show={isViewPopupOpen}
          user={selectedUser}
          onClose={() => setViewPopupOpen(false)}
          onOpenSpecialReg={handleOpenSpecialReg}
        />
      )}

      {selectedUser && (
        <SpecialRegistrationPopup
          show={isSpecialRegOpen}
          onClose={() => setSpecialRegOpen(false)}
          student={selectedUser}
        />
      )}
    </div>
  )
}

export default Users