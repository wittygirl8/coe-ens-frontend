export type Supplier = {
  bvd_id: string;
  ens_id: string;
  match_found: boolean;
  name: string;
  suggested_name: string;
  country: string;
  suggested_country: string;
  national_id: string;
  suggested_national_id: string;
  state: string;
  suggested_state: string;
  city: string;
  suggested_city: string;
  postcode: string;
  suggested_postcode: string;
  email_or_website: string;
  suggested_email_or_website: string;
  phone_or_fax: string;
  suggested_phone_or_fax: string;
  isCompleted: boolean;
  overall_status: 'COMPLETED' | 'IN_PROGRESS';
  final_validation_status: 'AUTO_ACCEPT' | 'AUTO_REJECT' | 'REVIEW';
  orbis_matched_status: 'MATCH' | 'NO_MATCH';
  duplicate_in_session: 'RETAIN' | 'REMOVE' | 'UNIQUE';
  validation_status: 'VALIDATED' | 'NOT_VALIDATED' | 'PENDING';
  report_generation_status:
    | 'COMPLETED'
    | 'IN_PROGRESS'
    | 'FAILED'
    | 'NOT_STARTED';
};
