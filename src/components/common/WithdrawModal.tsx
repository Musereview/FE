// 회원탈퇴 확인 모달
import { useEffect, useRef } from 'react';

interface WithdrawModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function WithdrawModal({ onCancel, onConfirm }: WithdrawModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      role="presentation"
      onClick={onCancel}
      className="fixed inset-y-0 right-0 left-[90px] z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdraw-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="flex w-[655px] flex-col items-center gap-12 rounded-[10px] border-[0.3px] border-gray-600 bg-gray-900 px-12 py-14">
        <div className="flex w-full flex-col items-center gap-3 text-center">
          <h2 id="withdraw-modal-title" className="heading-medium-b text-gray-100">
            정말 탈퇴하시겠습니까?
          </h2>
          <p className="body-medium text-gray-400">
            회원 탈퇴 시 모든 연주 기록, 분석 리포트 및 계정 정보가
            <br />
            영구적으로 삭제되며 복구할 수 없습니다.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="button-large1 h-[60px] w-[210px] cursor-pointer rounded-[6px] border-[0.5px] border-gray-600 text-gray-300 transition-colors hover:bg-gray-800">
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="button-large1 bg-primary-400 hover:bg-primary-500 h-[60px] w-[210px] cursor-pointer rounded-[4px] text-gray-950 transition-colors">
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

export default WithdrawModal;
