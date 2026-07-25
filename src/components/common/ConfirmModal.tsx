// 공통 확인 모달
import { useEffect, useId, useRef, type ReactNode } from 'react';

type ModalTone = 'default' | 'danger';
type ConfirmVariant = 'primary' | 'danger';

interface ConfirmModalProps {
  title: ReactNode;
  description?: ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  tone?: ModalTone;
  confirmVariant?: ConfirmVariant;
  dismissible?: boolean;
}

const titleToneClass: Record<ModalTone, string> = {
  default: 'text-gray-100',
  danger: 'text-error',
};

const confirmVariantClass: Record<ConfirmVariant, string> = {
  primary: 'bg-primary-400 hover:bg-primary-500 text-gray-950',
  danger: 'bg-error hover:bg-error/90 text-gray-100',
};

export function ConfirmModal({
  title,
  description,
  cancelLabel = '취소',
  confirmLabel = '확인',
  onCancel,
  onConfirm,
  tone = 'default',
  confirmVariant = 'primary',
  dismissible = true,
}: ConfirmModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!dismissible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dismissible, onCancel]);

  return (
    <div
      role="presentation"
      onClick={dismissible ? onCancel : undefined}
      className="fixed inset-y-0 right-0 left-[90px] z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="flex w-[655px] flex-col items-center gap-12 rounded-[10px] border-[0.3px] border-gray-600 bg-gray-900 px-12 py-14">
        <div className="flex w-full flex-col items-center gap-3 text-center">
          <h2 id={titleId} className={`heading-medium-b ${titleToneClass[tone]}`}>
            {title}
          </h2>
          {description && <p className="body-medium text-gray-400">{description}</p>}
        </div>

        <div className="flex items-center gap-4">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="button-large1 h-[60px] w-[210px] cursor-pointer rounded-[6px] border-[0.5px] border-gray-600 text-gray-300 transition-colors hover:bg-gray-800">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`button-large1 h-[60px] w-[210px] cursor-pointer rounded-[4px] transition-colors ${confirmVariantClass[confirmVariant]}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
