// 공통 모달 셸 — 내용이 자유로운 모달용. 취소/확인 버튼이 고정된 확인 모달은 common/ConfirmModal 사용
import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  onClose: () => void;
  overlayClassName: string;
  dialogClassName: string;
  dialogAriaLabel?: string;
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
  dialogAriaLabel,
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

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [lockBodyScroll]);

  return (
    <div role="presentation" onClick={closeOnBackdropClick ? onClose : undefined} className={overlayClassName}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={dialogAriaLabel}
        aria-labelledby={dialogAriaLabelledby}
        onClick={(event) => event.stopPropagation()}
        className={dialogClassName}>
        {children}
      </div>
    </div>
  );
}

export default Modal;
