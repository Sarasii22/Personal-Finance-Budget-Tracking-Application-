import { AppButton } from './Buttons';

const TopConfirmPopup = ({ open, title = 'Confirm Action', message, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-popup-top glass" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <AppButton className="btn btn-primary" onClick={onConfirm}>Yes</AppButton>
          <AppButton className="btn btn-danger" onClick={onCancel}>No</AppButton>
        </div>
      </div>
    </div>
  );
};

export default TopConfirmPopup;
