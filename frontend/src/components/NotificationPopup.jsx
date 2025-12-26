import React, { useState } from 'react';
import '@styles/al-popup.css';

const NotificationPopup = ({ notifications, onClose, onMarkRead }) => {
  const [selected, setSelected] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const isApproved = (msg = "") => msg.toLowerCase().includes("aprob");

  if (!notifications || notifications.length === 0) return null;

  const openDetail = (notif) => setSelected(notif);
  const closeDetail = () => setSelected(null);

  const handleMark = async (id) => {
    setLoadingId(id);
    await onMarkRead(id);
    setLoadingId(null);
    setSelected(null);
  };

  return (
    <div className="al-popup-overlay">
      <div className="al-popup-box" style={{ width: '520px', maxHeight: '85vh' }}>
        <button className="al-popup-close" onClick={onClose} aria-label="Cerrar">&times;</button>
        <div style={{ paddingTop: '4px' }}>
          <h2 className="al-popup-title">Nuevas Notificaciones</h2>
          <div style={{ maxHeight: '70vh', overflowY: 'auto', marginBottom: '10px' }}>
            {notifications.map((notif) => {
              const hasDetail = !isApproved(notif.message) && (notif.comment?.trim()?.length > 0);
              return (
                <div key={notif.id} className="notification-item-popup">
                  <p style={{ margin: 0, fontWeight: 'bold', wordBreak: 'break-word' }}>{notif.message}</p>
                  {!isApproved(notif.message) && (
                    <small style={{ color: '#555' }}>Estado: Rechazada</small>
                  )}
                  {hasDetail && (
                    <div className="al-popup-actions" style={{ justifyContent: 'flex-start', marginTop: '8px' }}>
                      <button
                        className="al-btn-confirm"
                        onClick={() => openDetail(notif)}
                      >
                        Ver detalle
                      </button>
                    </div>
                  )}
                  {isApproved(notif.message) && (
                    <div className="al-popup-actions" style={{ justifyContent: 'flex-start', marginTop: '8px' }}>
                      <button
                        className="al-btn-confirm"
                        onClick={() => handleMark(notif.id)}
                        disabled={loadingId === notif.id}
                      >
                        {loadingId === notif.id ? 'Marcando...' : 'Marcar leído'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selected && (
        <div className="al-popup-overlay" style={{ zIndex: 60 }}>
          <div className="al-popup-box" style={{ width: '500px', maxHeight: '75vh', overflow: 'auto' }}>
            <button className="al-popup-close" onClick={closeDetail} aria-label="Cerrar detalle">&times;</button>
            <h3 className="al-popup-title" style={{ marginBottom: '12px' }}>Detalle de notificación</h3>

            <div className="notification-item-popup" style={{ marginBottom: '12px' }}>
              <p style={{ margin: 0, fontWeight: 'bold', wordBreak: 'break-word' }}>{selected.message}</p>
              <div style={{ marginTop: '10px' }}>
                <strong>Observación:</strong>
                <div style={{ marginTop: '6px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {selected.comment?.trim() || 'Sin observación'}
                </div>
              </div>
            </div>

            <div className="al-popup-actions">
              <button className="al-btn-cancel" onClick={closeDetail}>Cerrar</button>
              <button
                className="al-btn-confirm"
                onClick={() => handleMark(selected.id)}
                disabled={loadingId === selected.id}
              >
                {loadingId === selected.id ? 'Marcando...' : 'Marcar leído'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPopup;