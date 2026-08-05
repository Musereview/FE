// Presigned URL로 S3에 녹음 파일을 직접 PUT 업로드한다.
// 백엔드 API가 아니라 S3로 직접 나가는 요청이라 axiosInstance(Authorization 헤더 자동 첨부)를 쓰지 않는다.
export async function uploadRecordingToS3(
  uploadUrl: string,
  blob: Blob,
  requiredHeaders: Record<string, string>,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: requiredHeaders,
    body: blob,
  });

  if (!res.ok) {
    throw new Error(`S3 업로드에 실패했습니다. (status: ${res.status})`);
  }
}
