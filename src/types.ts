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

// Enum for Relationship Types
export type RelationshipType = 'SUPPLIER_OF' | 'MANAGEMENT_OF';

// Node Type
export interface NodeBase {
  id: string;
  name: string;
  node_type: 'Organization' | 'Individual' | 'Company';
  node_colour: string;
  node_size: number;
}

export interface OrganizationNode extends NodeBase {
  node_type: 'Organization';
  national_id?: string;
  national_identifier: string;
  country: string;
  location: string;
  contact_id?: string;
  overall_rating: 'Low' | 'Medium' | 'High';
  additional_indicator_rating: 'Low' | 'Medium' | 'High';
  bribery_corruption_overall_rating: string;
  financials_rating: string;
  government_political_rating: string;
  other_adverse_media_rating: string;
  sanctions_rating: string;
  risk_intensity_score: number;
}

export interface IndividualNode extends NodeBase {
  node_type: 'Individual';
  sanctions_indicator: string;
  pep_indicator: string;
  media_indicator: string;
  risk_indicator: string;
}

export interface CompanyNode extends NodeBase {
  node_type: 'Company';
}

export type GraphNode = OrganizationNode | IndividualNode | CompanyNode;

// Link Type
export interface GraphLink {
  source: string;
  target: string;
  relationship_type: RelationshipType;
}

// Root Graph Type
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphLink[];
}

export interface Profile {
  profile: Record<string, string>;
  ratings: Record<string, string>;
  findings: Findings;
}

export type KPIEntry = {
  kpi_area: string; // e.g., "SAN"
  kpi_code: string; // e.g., "SAN1B"
  kpi_definition: string; // Description of the KPI
  kpi_rating: 'Low' | 'Medium' | 'High' | 'Critical'; // Assumes finite set of values
  kpi_flag: boolean; // Indicates if the KPI is triggered/active
  kpi_details: string; // Detailed description or notes, possibly multiline
};

export type Findings = {
  sanctions?: KPIEntry[];
  government_political?: KPIEntry[];
  bribery_corruption_overall?: KPIEntry[];
  financials?: KPIEntry[];
  other_adverse_media?: KPIEntry[];
  additional_indicator?: KPIEntry[];
};

// Each data entry in the 'data' array
interface MetricEntry {
  display_value: string;
  raw_value: number;
  closing_date: string; // ISO format
}

// The metric block like 'operating_revenue', 'ebitda', etc.
interface Metric {
  title: string;
  category:
    | 'PROFIT & LOSS ACCOUNT'
    | 'BALANCE SHEET'
    | 'STRUCTURE RATIOS'
    | 'PROFITABILITY RATIOS';
  data: MetricEntry[];
}

// The whole API data object
export type ApiData = Record<string, Metric>;
