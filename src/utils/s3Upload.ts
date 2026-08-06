// fetch는 기본 타임아웃이 없어 네트워크가 응답 없이 멈추면 무한 대기하게 된다.
// PracticePlayPage가 이 Promise를 기다리는 동안 전체화면 로딩을 유지하므로 반드시 상한을 둔다.
const UPLOAD_TIMEOUT_MS = 30000;

// Presigned URL로 S3에 녹음 파일을 직접 PUT 업로드한다.
// 백엔드 API가 아니라 S3로 직접 나가는 요청이라 axiosInstance(Authorization 헤더 자동 첨부)를 쓰지 않는다.
export async function uploadRecordingToS3(
  uploadUrl: string,
  blob: Blob,
  requiredHeaders: Record<string, string>,
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: requiredHeaders,
      body: blob,
      signal: controller.signal,
    });
  } catch (err) {
    // 타임아웃으로 인한 abort도 호출자 쪽 기존 오류 처리 경로(catch)로 그대로 전달
    if (controller.signal.aborted) {
      throw new Error('S3 업로드 요청이 시간 초과되었습니다.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    throw new Error(`S3 업로드에 실패했습니다. (status: ${res.status})`);
  }
}
