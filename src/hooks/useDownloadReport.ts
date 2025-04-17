import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import { API_ENDPOINTS } from '../config';

export function useDownloadReport({
  sessionId,
  ensId = '',
  fileType = 'pdf',
  type = 'single',
  fileName = 'report',
  enabled = false,
}: {
  sessionId: string;
  ensId?: string;
  fileType?: 'pdf' | 'docx' | 'zip';
  type?: 'single' | 'bulk';
  fileName?: string;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: ['download-report', sessionId, ensId, fileType],
    queryFn: async () => {
      const url =
        type === 'single'
          ? API_ENDPOINTS.SINGLE_REPORT_DOWNLOAD(sessionId, ensId, fileType)
          : API_ENDPOINTS.BULK_REPORT_DOWNLOAD(sessionId);

      const response = await axiosInstance.get(url, { responseType: 'blob' });
      const blob = response.data;

      const fileUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = `${fileName}.${fileType}`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(fileUrl);
      document.body.removeChild(a);

      return true;
    },
    enabled,
    staleTime: Infinity,
    retry: false,
  });
}
