export const generateRandomId = () => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
};

export const riskColors = {
  High: '#FF0000',
  Medium: '#FFE600',
  Low: '#2DB757',
  Default: '#f2f2f2',
  'No Alerts': '#f2f2f2',
};

export const overviewFields = [
  { label: 'Address', key: 'address' },
  { label: 'Website', key: 'website' },
  { label: 'Active Status', key: 'active_status' },
  { label: 'Employee', key: 'employee' },
  { label: 'Operation Type', key: 'operation_type' },
  { label: 'Legal Status', key: 'legal_status' },
  { label: 'Alias', key: 'alias' },
  { label: 'Incorporation Date', key: 'incorporation_date' },
  { label: 'Revenue', key: 'revenue' },
  { label: 'Subsidiaries', key: 'subsidiaries' },
  { label: 'Corporate Group', key: 'corporate_group' },
  { label: 'Shareholders', key: 'shareholders' },
  { label: 'Key Executives', key: 'key_executives' },
];

export const overviewRatings = [
  { label: 'Sanctions', key: 'sanctions' },
  {
    label: 'Anti-Bribery and Anti-Corruption',
    key: 'bribery_corruption_overall',
  },
  {
    label: 'Government Ownership and Political Affiliations',
    key: 'government_political',
  },
  { label: 'Other Adverse Media', key: 'other_adverse_media' },
  { label: 'Financial Indicators', key: 'financials' },
  { label: 'Additional Indicators', key: 'additional_indicator' },
];
