const APPLICATION_BACKEND = import.meta.env.VITE_APPLICATION_BACKEND;
const ANALYSIS_ORCHESTRATION = import.meta.env.VITE_ANALYSIS_ORCHESTRATION;

const ORCHESTRATOR_API = {
  TRIGGER_SUPPLIER_VALIDATION: `${ANALYSIS_ORCHESTRATION}/analysis/trigger-supplier-validation`,
  TRIGGER_ANALYSIS: `${ANALYSIS_ORCHESTRATION}/analysis/trigger-analysis`,
  SESSION_STATUS: (session_id: string) =>
    `${ANALYSIS_ORCHESTRATION}/status/poll-session-status?session_id=${session_id}`,
  ENS_ID_STATUS: (session_id: string, ens_id: string) =>
    `${ANALYSIS_ORCHESTRATION}/status/poll-ensid-status?session_id=${session_id}&ens_id=${ens_id}`,
};

const BACKEND_API = {
  UPLOAD_EXCEL: `${APPLICATION_BACKEND}/supplier/upload-excel`,
  GET_SESSION_SCREENING_STATUS: `${APPLICATION_BACKEND}/supplier/get-session-screening-status`,
  CURRENT_USER: `${APPLICATION_BACKEND}/users/me`,
  UPDATE_SUGGESTION_BULK: `${APPLICATION_BACKEND}/supplier/update-suggestions-bulk`,
  LOGIN: `${APPLICATION_BACKEND}/auth/login`,
  SUPPLIER_NO_MATCH_COUNT: (session_id: string) =>
    `${APPLICATION_BACKEND}/supplier/get-nomatch-count?session_id=${session_id}`,
  GET_SUPPLIER_DATA: (session_id: string) =>
    `${APPLICATION_BACKEND}/supplier/get-supplier-data?session_id=${session_id}`,
  GET_MAIN_SUPPLIER_DATA: (session_id: string) =>
    `${APPLICATION_BACKEND}/supplier/get-main-supplier-data?session_id=${session_id}`,
  UPDATE_SUGGESTION_SINGLE: (session_id: string) =>
    `${APPLICATION_BACKEND}/supplier/update-suggestions-single?session_id=${session_id}`,
  SINGLE_REPORT_DOWNLOAD: (
    session_id: string,
    ens_id: string,
    fileType: string,
  ) =>
    `${APPLICATION_BACKEND}/report/download-report/?session_id=${session_id}&ens_id=${ens_id}&type_of_file=${fileType}`,
  BULK_REPORT_DOWNLOAD: (session_id: string) =>
    `${APPLICATION_BACKEND}/report/bulk-download-report/?session_id=${session_id}`,
};

export const API_ENDPOINTS = {
  ...ORCHESTRATOR_API,
  ...BACKEND_API,
};
