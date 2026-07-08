// 연주 트랙 설정 페이지
import { useNavigate, useParams } from 'react-router-dom';
import { SettingsModal } from '@/components/settings/SettingsModal';

function PracticeSettingsPage() {
  const navigate = useNavigate();
  const { practiceId } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-bold">연주 트랙 설정</h1>

      <SettingsModal
        onClose={() => navigate(`/practice/${practiceId}`)} // X 클릭 → 상세 화면
        onStart={() => navigate(`/practice/${practiceId}/play`)} // 시작하기 → 연주 화면
      />
    </div>
  );
}

export default PracticeSettingsPage;
