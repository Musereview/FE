// 회원탈퇴 확인 모달
import ConfirmModal from './ConfirmModal';

interface WithdrawModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function WithdrawModal({ onCancel, onConfirm }: WithdrawModalProps) {
  return (
    <ConfirmModal
      title="정말 탈퇴하시겠습니까?"
      description={
        <>
          회원 탈퇴 시 개인정보는 삭제되지만,
          <br />
          연주 기록은 삭제되지 않습니다.
        </>
      }
      cancelLabel="취소"
      confirmLabel="탈퇴하기"
      confirmVariant="danger"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

export default WithdrawModal;
