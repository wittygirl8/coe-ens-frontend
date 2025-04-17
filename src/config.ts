// @ts-nocheck
const {
  VITE_APPLICATION_BACKEND: APPLICATION_BACKEND,
  VITE_ANALYSIS_ORCHESTRATION: ANALYSIS_ORCHESTRATION,
  VITE_ORBIS_API: ORBIS_API,
} = import.meta.env;

export const ORBIS_URL = ORBIS_API;

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
    fileType: string
  ) =>
    `${APPLICATION_BACKEND}/report/download-report/?session_id=${session_id}&ens_id=${ens_id}&type_of_file=${fileType}`,
  BULK_REPORT_DOWNLOAD: (session_id: string) =>
    `${APPLICATION_BACKEND}/report/bulk-download-report/?session_id=${session_id}`,
};

export const API_ENDPOINTS = {
  ...ORCHESTRATOR_API,
  ...BACKEND_API,
};
