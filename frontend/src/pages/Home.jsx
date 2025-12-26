import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { getMyNotifications, markNotificationAsRead } from '@services/notification.service';
import { showErrorAlert } from '@helpers/sweetAlert';
import NotificationPopup from '@components/NotificationPopup';
import electivosImg from "../assets/PersonIcon.svg";
import '@styles/home.css';

const Home = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user?.rol === 'Profesor') {
        const response = await getMyNotifications();
        if (response.status === 'Success' && response.data.length > 0) {
          const unread = response.data.filter(n => !n.isRead);
          if (unread.length > 0) {
            setNotifications(unread);
            setShowPopup(true);
          }
        } else if (response.status !== 'Success') {
          showErrorAlert('Error', 'No se pudieron cargar las notificaciones.');
        }
      }
    };

    fetchNotifications();
  }, [user]);

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleMarkRead = async (id) => {
    const response = await markNotificationAsRead(id);
    if (response.status === 'Success') {
      setNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        if (updated.length === 0) {
          setShowPopup(false);
        }
        return updated;
      });
    } else {
      showErrorAlert('Error', 'No se pudo marcar como leída la notificación.');
    }
  };

  return (
    <div>
      {user?.rol === 'Profesor' && showPopup && (
        <NotificationPopup
          notifications={notifications}
          onClose={handleClosePopup}
          onMarkRead={handleMarkRead}
        />
      )}
      <main className="home-container">
        <div className="home-hero">
          <img src={electivosImg} alt="Electivos" className="home-hero__image" />
          <div className="home-content">
            <h1>Bienvenido, {user?.nombreCompleto || 'Usuario'}</h1>
            <p>Has iniciado sesión como: <strong>{user?.rol}</strong></p>
            <p className="home-subtext">
              Aquí podrás gestionar, inscribirte y consultar los electivos disponibles en tu carrera.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;