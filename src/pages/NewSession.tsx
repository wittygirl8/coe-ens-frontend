import { useQuery } from '@tanstack/react-query';
import Steps from '../components/Stepper';
import MainDashboardLayout from '../layouts/MainDashboardLayout';
import axiosInstance from '../utils/axiosInstance';
import { API_ENDPOINTS } from '../config';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router';

export default function NewSession() {
  const navigate = useNavigate();

  useQuery({
    queryKey: ['users/me'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(API_ENDPOINTS.CURRENT_USER);
        return res.data;
      } catch (error: any) {
        const errorResponse = error as AxiosError;
        if (errorResponse?.response?.status === 401) {
          navigate('/login');
        }
        throw error;
      }
    },
  });

  return (
    <MainDashboardLayout>
      <Steps />
    </MainDashboardLayout>
  );
}
