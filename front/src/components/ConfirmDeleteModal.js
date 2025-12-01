import React from 'react';
import './ConfirmDeleteModal.css';

function ConfirmDeleteModal({ onConfirm, onClose, title = "Подтверждение удаления", message = "Вы уверены, что хотите выполнить это действие?" }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content confirm-delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-delete-content">
          <h2>{title}</h2>
          <p>{message}</p>
          <p className="warning-text">Это действие нельзя отменить!</p>
          <div className="modal-buttons">
            <button className="button-danger" onClick={onConfirm}>
              Да, удалить
            </button>
            <button onClick={onClose}>Отмена</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
