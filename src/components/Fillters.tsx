import {
  Flex,
  MultiSelect,
  Button,
  Text,
  Card,
  Box,
  Loader,
} from '@mantine/core';
import { useSetState } from '@mantine/hooks';
import axiosInstance from '../utils/axiosInstance';
import { API_ENDPOINTS } from '../config';
import { riskColors } from '../helpers';
import React, { useEffect } from 'react';
import { GraphData } from '../types';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router';

// --- Types ---
type FilterState = {
  country: string[];
  overall_rating: string[];
  ratings: Record<string, string[]>; // dynamic sections like sanctions, media etc.
  filter_multiple_connections_direct: boolean;
  filter_multiple_connections_indirect: boolean;
};

const riskSections = [
  {
    label: 'Sanctions',
    value: 'sanctions_rating',
  },
  {
    label: 'Anti-Bribery and Anti-Corruption',
    value: 'bribery_corruption_overall_rating',
  },
  {
    label: 'Government Ownership and Political Affiliations',
    value: 'government_political_rating',
  },
  {
    label: 'Financials',
    value: 'financials_rating',
  },
  {
    label: 'Other Adverse Media',
    value: 'other_adverse_media_rating',
  },
  {
    label: 'Additional Indicators',
    value: 'additional_indicator_rating',
  },
];

// --- Rating Buttons ---
type RatingButtonsProps = {
  value: string[];
  onChange: (values: string[]) => void;
};

const RatingButtons = ({ value, onChange }: RatingButtonsProps) => {
  const ratings: (keyof typeof riskColors)[] = ['High', 'Medium', 'Low'];

  const toggleSelection = (rating: string) => {
    if (value.includes(rating)) {
      onChange(value.filter((r) => r !== rating));
    } else {
      onChange([...value, rating]);
    }
  };

  return (
    <Button.Group>
      {ratings.map((level) => (
        <Button
          key={level}
          fullWidth
          size="xs"
          variant={value.includes(level) ? 'filled' : 'default'}
          bg={value.includes(level) ? riskColors[level] : undefined}
          onClick={() => toggleSelection(level)}
          c="black"
        >
          {level}
        </Button>
      ))}
    </Button.Group>
  );
};

// --- Rating Card for each Section ---
const RatingCard = ({
  title,
  value,
  onChange,
}: {
  title: string;
  value: string[];
  onChange: (val: string[]) => void;
}) => (
  <Box mb="md">
    <Text tt="capitalize" className="custom-label">
      {title}
    </Text>
    <RatingButtons value={value} onChange={onChange} />
  </Box>
);

// --- Supplier Rating Section ---
const SupplierRating = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (val: string[]) => void;
}) => {
  return (
    <Card shadow="sm" radius="md" withBorder>
      <RatingCard title="Supplier Rating" value={value} onChange={onChange} />
    </Card>
  );
};

// --- Other Ratings Section ---
const OtherRatings = ({
  values,
  onChange,
}: {
  values: Record<string, string[]>;
  onChange: (section: string, val: string[]) => void;
}) => (
  <Card shadow="sm" radius="md" withBorder>
    {riskSections.map((section) => (
      <RatingCard
        key={section.value}
        title={section.label}
        value={values[section.value] ?? []}
        onChange={(val) => onChange(section.value, val)}
      />
    ))}
  </Card>
);

// --- Country Dropdown ---
const CountryDropdown = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (val: string[]) => void;
}) => {
  const [countryOptions, setCountryOptions] = React.useState<
    { label: string; value: string }[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    axiosInstance
      .get(
        API_ENDPOINTS.GET_SUPPLIER_COUNTRIES(
          '5b638302-73cb-4a69-b76d-1efa5c00797a'
        )
      )
      .then((response) => {
        setCountryOptions(response.data);
      })
      .catch((error) => {
        // handle 401 error
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        notifications.show({
          title: 'Error',
          message: 'Failed to fetch countries list',
          color: 'red',
          position: 'top-right',
          autoClose: false,
        });

        console.error('Error fetching country data:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <MultiSelect
      label="Countries"
      placeholder="Pick Countries"
      data={countryOptions}
      value={value}
      onChange={onChange}
      searchable
      checkIconPosition="right"
      withAsterisk
      clearable
      rightSection={isLoading ? <Loader size={14} /> : null}
    />
  );
};

// --- Main Filter Component ---
const Filters = ({
  setGraphData,
  setIsLoading,
}: {
  setGraphData: React.Dispatch<React.SetStateAction<GraphData>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [filters, setFilters] = useSetState<FilterState>({
    country: [],
    overall_rating: [],
    ratings: {},
    filter_multiple_connections_direct: false,
    filter_multiple_connections_indirect: false,
  });

  const handleRatingChange = (section: string, val: string[]) => {
    setFilters({ ratings: { ...filters.ratings, [section]: val } });
  };

  useEffect(() => {
    if (filters.country.length === 0) {
      setGraphData({ nodes: [], edges: [] });
      return;
    }

    const controller = new AbortController();

    setIsLoading(true);

    axiosInstance
      .post(
        API_ENDPOINTS.GET_GRAPH,
        {
          ...filters,
          ...filters.ratings,
          ratings: undefined,
          client: 'Aramco',
        },
        {
          signal: controller.signal,
        }
      )
      .then((response) => {
        const data = response.data;
        setGraphData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        if (error.name === 'CanceledError') {
          console.log('Previous request canceled');
        } else {
          notifications.show({
            title: 'Error',
            message: 'Failed to fetch graph data, please try again',
            color: 'red',
            autoClose: false,
            position: 'top-right',
          });
          console.error('Error fetching graph data:', error);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      controller.abort(); // cancel previous request
    };
  }, [filters]);

  return (
    <Flex direction="column" gap="lg">
      <CountryDropdown
        value={filters.country}
        onChange={(val) => setFilters({ country: val })}
      />
      <SupplierRating
        value={filters.overall_rating}
        onChange={(val) => setFilters({ overall_rating: val })}
      />
      <OtherRatings values={filters.ratings} onChange={handleRatingChange} />

      <Card shadow="sm" radius="md" withBorder>
        <Text tt="capitalize" className="custom-label">
          InterConnections
        </Text>
        {/* Direct or Multiple */}
        <Button.Group>
          <Button
            fullWidth
            size="xs"
            variant={
              filters.filter_multiple_connections_direct ? 'filled' : 'default'
            }
            bg={
              filters.filter_multiple_connections_direct
                ? 'lightblue'
                : undefined
            }
            // variant="default"
            onClick={() => {
              setFilters((prev) => ({
                ...prev,
                filter_multiple_connections_direct:
                  !prev.filter_multiple_connections_direct,
              }));
            }}
            c="black"
          >
            Direct
          </Button>
          <Button
            fullWidth
            size="xs"
            // variant="default"
            variant={
              filters.filter_multiple_connections_indirect
                ? 'filled'
                : 'default'
            }
            bg={
              filters.filter_multiple_connections_indirect
                ? 'skyblue'
                : undefined
            }
            onClick={() => {
              setFilters((prev) => ({
                ...prev,
                filter_multiple_connections_indirect:
                  !prev.filter_multiple_connections_indirect,
              }));
            }}
            c="black"
          >
            Multiple
          </Button>
        </Button.Group>
      </Card>
    </Flex>
  );
};

export default Filters;
