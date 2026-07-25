// 장치 연결 끊김 안내 모달
import ConfirmModal from './ConfirmModal';

interface DeviceDisconnectedModalProps {
  /** 연습 종료 */
  onEndPractice: () => void;
  /** 설정으로 이동 */
  onGoSettings: () => void;
}

export function DeviceDisconnectedModal({ onEndPractice, onGoSettings }: DeviceDisconnectedModalProps) {
  return (
    <ConfirmModal
      title="장치 연결이 끊어졌습니다."
      description="설정에서 연결을 다시 확인해 주세요."
      tone="danger"
      cancelLabel="연습 종료"
      confirmLabel="설정으로"
      confirmVariant="primary"
      dismissible={false}
      onCancel={onEndPractice}
      onConfirm={onGoSettings}
    />
  );
}

export default DeviceDisconnectedModal;
