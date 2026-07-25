import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  onClose: () => void;
  overlayClassName: string;
  dialogClassName: string;
  dialogAriaLabelledby?: string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  lockBodyScroll?: boolean;
  children: ReactNode;
}

function Modal({
  onClose,
  overlayClassName,
  dialogClassName,
  dialogAriaLabelledby,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  lockBodyScroll = false,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!closeOnEscape) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEscape, onClose]);

  useEffect(() => {
    if (!lockBodyScroll) return;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [lockBodyScroll]);

  return (
    <div role="presentation" onClick={closeOnBackdropClick ? onClose : undefined} className={overlayClassName}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogAriaLabelledby}
        onClick={(event) => event.stopPropagation()}
        className={dialogClassName}>
        {children}
      </div>
    </div>
  );
}

export default Modal;
