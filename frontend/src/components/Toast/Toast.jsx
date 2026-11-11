import "./Toast.css";

export default function ToastContainer({ toasts, onClose }) {
  return (
    <div className='toast-container' role='region' aria-live='polite'>
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`} role='alert'>
          <div className='toast__body'>
            <strong>{t.message}</strong>
            {t.description ? <p>{t.description}</p> : null}
          </div>
          <button
            className='toast__close'
            aria-label='Dismiss'
            onClick={() => onClose(t.id)}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
