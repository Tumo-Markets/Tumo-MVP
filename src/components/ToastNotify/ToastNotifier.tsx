import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { X } from 'lucide-react';

export function ToastNotifier() {
  return (
    <ToastContainer
      autoClose={5000}
      position="top-center"
      newestOnTop={true}
      hideProgressBar={true}
      style={{ width: 'auto', maxWidth: '90%', minWidth: '280px', height: 'auto', borderRadius: '16px' }}
      toastStyle={{
        borderRadius: '16px',
        paddingLeft: '12px',
        paddingRight: '44px', // Extra padding to make room for close button
        paddingTop: '16px',
        paddingBottom: '16px',
        boxShadow: '0px 4px 20px 0px #16161626, 0px 8px 32px 6px #16161605',
        border: '1px solid #424752',
        backgroundColor: '#0C0E14',
        color: '#FFFFFF',
        position: 'relative',
      }}
      closeButton={({ closeToast }) => (
        <button
          type="button"
          onClick={closeToast}
          aria-label="close"
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 6,
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            color: '#FFFFFF',
            opacity: 0.7,
            cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
        >
          <X size={16} />
        </button>
      )}
    />
  );
}
