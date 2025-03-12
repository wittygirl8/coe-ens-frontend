// export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_ENDPOINTS = {
  // Orchestrator API Endpoints
  TRIGGER_SUPPLIER_VALIDATION: `/orc-api/analysis/trigger-supplier-validation`,
  TRIGGER_ANALYSIS: `/orc-api/analysis/trigger-analysis`,

  SESSION_STATUS: (session_id: string) =>
    `/orc-api/status/poll-session-status?session_id=${session_id}`,
  ENS_ID_STATUS: (session_id: string, ens_id: string) =>
    `/orc-api/status/poll-ensid-status?session_id=${session_id}&ens_id=${ens_id}`,

  // BackEnd API Endpoints
  UPLOAD_EXCEL: `/api/supplier/upload-excel`,
  GET_SESSION_SCREENING_STATUS: `/api/supplier/get-session-screening-status`,
  SUPPLIER_NO_MATCH_COUNT: (session_id: string) =>
    `/api/supplier/get-nomatch-count?session_id=${session_id}`,
  GET_SUPPLIER_DATA: (session_id: string) =>
    `/api/supplier/get-supplier-data?session_id=${session_id}`,
  GET_MAIN_SUPPLIER_DATA: (session_id: string) =>
    `/api/supplier/get-main-supplier-data?session_id=${session_id}`,
};
