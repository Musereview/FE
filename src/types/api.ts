// 공통 API 성공 응답
export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  data: T;
}

// 공통 API 에러 응답
export interface ApiErrorResponse<T = null> {
  isSuccess: boolean;
  code: string;
  message: string;
  data: T;
}
