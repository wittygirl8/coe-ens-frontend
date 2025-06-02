// @ts-nocheck
const {
  VITE_APPLICATION_BACKEND: APPLICATION_BACKEND,
  VITE_ANALYSIS_ORCHESTRATION: ANALYSIS_ORCHESTRATION,
  VITE_SOCKET_URL: SOCKET_URL,
} = import.meta.env;

const ORCHESTRATOR_API = {
  TRIGGER_SUPPLIER_VALIDATION: `${ANALYSIS_ORCHESTRATION}/analysis/trigger-supplier-validation`,
  TRIGGER_ANALYSIS: `${ANALYSIS_ORCHESTRATION}/analysis/trigger-analysis`,
};

const BACKEND_API = {
  UPLOAD_EXCEL: `${APPLICATION_BACKEND}/supplier/upload-excel`,
  GET_SESSION_SCREENING_STATUS: `${APPLICATION_BACKEND}/supplier/get-session-screening-status?screening_analysis_status=active`,
  CURRENT_USER: `${APPLICATION_BACKEND}/users/me`,
  UPDATE_SUGGESTION_BULK: `${APPLICATION_BACKEND}/supplier/update-suggestions-bulk`,
  LOGIN: `${APPLICATION_BACKEND}/auth/login`,
  GET_GRAPH: `${APPLICATION_BACKEND}/graph/get-network-graph`,
  SUBMODAL_FINDINGS: `${APPLICATION_BACKEND}/graph/get-submodal-findings`,
  GET_SUBMODAL_FINANCIALS: `${APPLICATION_BACKEND}/graph/get-submodal-financials`,
  GET_SUPPLIER_COUNTRIES: (clientId: string) =>
    `${APPLICATION_BACKEND}/graph/supplier-countries?client_id=${clientId}`,
  SUPPLIER_NO_MATCH_COUNT: (session_id: string) =>
    `${APPLICATION_BACKEND}/supplier/get-nomatch-count?session_id=${session_id}`,
  GET_SUPPLIER_DATA: (session_id: string) =>
    `${APPLICATION_BACKEND}/supplier/get-supplier-data?session_id=${session_id}`,
  GET_MAIN_SUPPLIER_DATA: (session_id: string) =>
    `${APPLICATION_BACKEND}/supplier/get-main-supplier-data-compiled?session_id=${session_id}`,
  UPDATE_SUGGESTION_SINGLE: (session_id: string) =>
    `${APPLICATION_BACKEND}/supplier/update-suggestions-single?session_id=${session_id}`,
  SINGLE_REPORT_DOWNLOAD: (
    session_id: string,
    ens_id: string,
    fileType: string
  ) =>
    `${APPLICATION_BACKEND}/report/download-report/?session_id=${session_id}&ens_id=${ens_id}&type_of_file=${fileType}`,
  BULK_REPORT_DOWNLOAD: (session_id: string) =>
    `${APPLICATION_BACKEND}/report/bulk-download-report/?session_id=${session_id}`,
  STREAMING_SESSION_STATUS: (session_id?: string) =>
    session_id
      ? `${SOCKET_URL}/session-status?session_id=${session_id}`
      : `${SOCKET_URL}/session-status`,
  STREAMING_ENSID_STATUS: (session_id: string) =>
    `${SOCKET_URL}/ensid-status?session_id=${session_id}`,
};

export const API_ENDPOINTS = {
  ...ORCHESTRATOR_API,
  ...BACKEND_API,
};
