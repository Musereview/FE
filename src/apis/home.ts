import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '@/types/api';
import type { DashboardData } from '@/types/home';

const HOME_ENDPOINT = '/api/home';

export async function fetchDashboardData(): Promise<DashboardData> {
  const { data } = await axiosInstance.get<ApiResponse<DashboardData>>(HOME_ENDPOINT);
  return data.data;
}
