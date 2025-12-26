import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { getMyNotifications, markNotificationAsRead } from '@services/notification.service';
import { showErrorAlert } from '@helpers/sweetAlert';
import NotificationPopup from '@components/NotificationPopup';
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
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setShowPopup((prev) => {
        const remaining = notifications.filter((n) => n.id !== id);
        return remaining.length > 0;
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
        <div className="home-content">
          <h1>Bienvenido, {user?.nombreCompleto || 'Usuario'}</h1>
          <p>Has iniciado sesión como: <strong>{user?.rol}</strong></p>
        </div>
      </main>
    </div>
  );
};

export default Home;