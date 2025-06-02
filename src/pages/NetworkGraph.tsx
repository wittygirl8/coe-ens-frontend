import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Image,
  Loader,
  LoadingOverlay,
  Modal,
  ScrollArea,
  SegmentedControl,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { useDisclosure, useScrollSpy } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import axios from 'axios';

import MainDashboardLayout from '../layouts/MainDashboardLayout';
import Filters from '../components/Fillters';
import { ApiData, GraphData, KPIEntry, Profile } from '../types';
import axiosInstance from '../utils/axiosInstance';
import MainGraph from '../components/Graph/MainGraph';
import { API_ENDPOINTS } from '../config';
import {
  generateRandomId,
  overviewFields,
  overviewRatings,
  riskColors,
} from '../helpers';

const ModalPopup = ({
  selectedNode,
  setSelectedNode,
  selectedNodeName,
}: {
  selectedNode: string | null;
  setSelectedNode: React.Dispatch<React.SetStateAction<string | null>>;
  selectedNodeName: string;
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [value, setValue] = useState('overview');

  const [profile, setProfile] = useState<Profile | null>(null);
  const [financialData, setFinancialData] = useState<ApiData | null>(null);

  const controllerRef = useRef<AbortController | null>(null);

  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedNode) {
      open();
    }
  }, [selectedNode, open]);

  const resetGraph = () => {
    setSelectedNode(null);
    setProfile(null);
    setValue('overview');
    close();
  };

  useEffect(() => {
    if (!selectedNode) return;

    const controller = new AbortController();
    controllerRef.current = controller; // Save controller reference
    const { signal } = controller;

    const fetchData = async () => {
      setIsLoading(true);

      try {
        const [profileRes, graphRes, financialsRes] = await Promise.all([
          axiosInstance.post(
            API_ENDPOINTS.SUBMODAL_FINDINGS,
            {
              ens_id: selectedNode,
            },
            { signal }
          ),
          axiosInstance.post(
            API_ENDPOINTS.GET_GRAPH,
            {
              submodal_id: selectedNode,
              client: 'Aramco',
            },
            { signal }
          ),
          axiosInstance.post(
            API_ENDPOINTS.GET_SUBMODAL_FINANCIALS,
            {
              ens_id: selectedNode,
            },
            { signal }
          ),
        ]);

        setProfile(profileRes.data);
        setGraphData(graphRes.data);
        setFinancialData(financialsRes.data.financials);
      } catch (error: any) {
        if (axios.isCancel(error) || error.name === 'CanceledError') {
          console.log('Request cancelled');
        } else {
          const nodeName =
            graphData?.nodes?.find((node) => node.id === selectedNode)?.name ||
            'Selected node';

          notifications.show({
            title: 'Error fetching data',
            message: `Something went wrong while loading data for "${nodeName}". Please try again later.`,
            color: 'red',
            autoClose: false,
            position: 'top-right',
          });

          resetGraph();
          console.error('Data fetch error:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort(); // Abort when selectedNode changes
    };
  }, [selectedNode]);

  return (
    <Modal
      opened={opened}
      onClose={() => {
        resetGraph();
      }}
      title={selectedNodeName}
      centered
      size="80rem"
      keepMounted
    >
      <SegmentedControl
        w="100%"
        transitionDuration={500}
        transitionTimingFunction="linear"
        value={value}
        onChange={setValue}
        data={[
          {
            value: 'overview',
            label: 'Overview',
          },
          {
            value: 'findings',
            label: 'Findings',
            disabled: !profile?.findings,
          },
          {
            value: 'financial',
            label: 'Financial',
            disabled: !profile?.findings,
          },
        ]}
      />

      <Box style={{ display: value === 'overview' ? 'block' : 'none' }}>
        <Overview
          isLoading={isLoading}
          graphData={graphData}
          setSelectedNode={setSelectedNode}
          profile={profile}
        />
      </Box>

      {value === 'findings' && <Findings profile={profile} />}
      {value === 'financial' && <Financial financialData={financialData} />}
    </Modal>
  );
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  const month = date.toLocaleString('default', { month: 'short' }); // e.g., Jun
  const year = String(date.getFullYear()).slice(2); // e.g., 2024 → 24
  return `${month} ${year}`;
};

const colors = [
  'blue.6',
  'cyan.6',
  'teal.6',
  'green.6',
  'yellow.6',
  'orange.6',
  'red.6',
  'grape.6',
  'indigo.6',
  'violet.6',
  'pink.6',
  'lime.6',
  '#09b8ff',
];

const formatCompact = (value: number) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value);

const Financial = ({ financialData }: { financialData: ApiData | null }) => {
  const chartsByCategory: Record<string, any[]> = {};

  financialData &&
    Object.entries(financialData).forEach(([_, metric]) => {
      if (!metric.data || metric.data.length === 0) return; // skip empty data

      const chartData = metric.data.map((entry) => ({
        date: formatDate(entry.closing_date),
        [metric.title]: entry.raw_value, // assuming values in millions
        display_value: entry.display_value,
      }));

      const chartItem = {
        title: metric.title,
        data: chartData,
        dataKey: 'date',
        seriesName: metric.title,
      };

      const category = metric.category || 'Others';
      if (!chartsByCategory[category]) {
        chartsByCategory[category] = [];
      }

      chartsByCategory[category].push(chartItem);
    });

  if (!financialData) {
    return (
      <Box
        style={{
          display: 'grid',
          placeItems: 'center',
          height: '100%',
          minHeight: '55vh',
        }}
      >
        <Loader />
      </Box>
    );
  }

  return (
    <ScrollArea h={'55vh'} w={'100%'} offsetScrollbars>
      <Grid>
        {Object.entries(chartsByCategory).map(([category, charts]) => (
          <Grid.Col key={category} span={12} mt="md">
            <Card shadow="sm" radius="md" withBorder>
              <Card.Section withBorder>
                <Text my="sm" ta="center" fw={500}>
                  {category}
                </Text>
              </Card.Section>
              <Grid mt="md">
                {charts.map((chart, index) => (
                  <Grid.Col key={index} span={4}>
                    <Text mb="md" ta="center">
                      {chart.title}
                    </Text>

                    <BarChart
                      h={180}
                      data={chart.data}
                      dataKey={chart.dataKey}
                      series={[
                        { name: chart.seriesName, color: colors[index] },
                      ]}
                      valueFormatter={(value) => formatCompact(value)}
                      barChartProps={{ syncId: 'financial' }}
                      withBarValueLabel
                      maxBarWidth={15}
                      withTooltip={false}
                      yAxisProps={{
                        tickFormatter: formatCompact,
                      }}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </ScrollArea>
  );
};

const Findings = ({ profile }: { profile: Profile | null }) => {
  const spy = useScrollSpy({
    selector: '.overscroll',
  });
  const [active, setActive] = useState(0);

  return (
    <Grid mb="md">
      <Grid.Col span={3}>
        <ScrollArea
          h={'55vh'}
          mt="md"
          w={'100%'}
          offsetScrollbars
          pr={4}
          className="custom-modal-popup"
        >
          {spy.data.map((heading, index) => (
            <Card
              key={heading.id}
              shadow="sm"
              radius="md"
              withBorder
              mb="md"
              style={{ cursor: 'pointer' }}
              className={`${index === active ? 'active-card' : ''}`}
              onClick={() => {
                heading.getNode().scrollIntoView({ behavior: 'smooth' });
                setActive(index);
              }}
            >
              <Text size="md" pr="xs" fw={400}>
                {overviewRatings[index].label}
              </Text>
              <Button
                size="xs"
                fullWidth
                c="black"
                mt="sm"
                bg={
                  riskColors[
                    (profile?.ratings[
                      overviewRatings[index].key
                    ] as keyof typeof riskColors) ?? 'Default'
                  ]
                }
              >
                {profile?.ratings[overviewRatings[index].key]}
              </Button>
            </Card>
          ))}
        </ScrollArea>
      </Grid.Col>
      <Grid.Col span={9}>
        <ScrollArea
          h={'55vh'}
          mt="md"
          w={'100%'}
          offsetScrollbars
          className="custom-modal-popup"
        >
          {overviewRatings.map((rating) => (
            <Box key={rating.key} className="overscroll">
              <Card
                shadow="sm"
                radius="md"
                withBorder
                // mt="md"
                m={4}
                style={{ height: '100%', minHeight: '100%' }}
              >
                <Card.Section withBorder px={16} py={12}>
                  <Flex justify={'space-between'} align="center">
                    <Title order={5} fw={500} tt="uppercase">
                      {rating.label}
                    </Title>
                    <Button
                      size="xs"
                      w={90}
                      c="black"
                      bg={
                        riskColors[
                          (profile?.ratings[
                            rating.key
                          ] as keyof typeof riskColors) ?? 'Default'
                        ]
                      }
                    >
                      {profile?.ratings[rating.key]}
                    </Button>
                  </Flex>
                </Card.Section>
                {/* <Divider my="sm" /> */}
                {profile?.findings?.[
                  rating.key as keyof typeof profile.findings
                ]?.map((entry: KPIEntry) => (
                  <FindingsTable key={generateRandomId()} entry={entry} />
                ))}
                {profile?.findings?.[
                  rating.key as keyof typeof profile.findings
                ]?.length === 0 && <NoTrueHitsFound />}
              </Card>
            </Box>
          ))}
        </ScrollArea>
      </Grid.Col>
    </Grid>
  );
};

const Overview = ({
  profile,
  setSelectedNode,
  isLoading,
  graphData,
}: {
  profile: Profile | null;
  setSelectedNode: React.Dispatch<React.SetStateAction<string | null>>;
  isLoading: boolean;
  graphData: GraphData;
}) => {
  return (
    <Grid mb="md">
      <Grid.Col span={3}>
        <Box pos="relative">
          <LoadingOverlay
            visible={isLoading}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 9 }}
          />
          <ScrollArea
            h={'55vh'}
            w={'100%'}
            offsetScrollbars
            mt={'md'}
            className="custom-modal-popup"
          >
            <Card shadow="sm" radius="md" withBorder mb="md">
              <Text size="md" mb="md">
                {profile?.profile?.name ?? 'No Name'}
              </Text>
              <Text size="sm" c="dimmed">
                {profile?.profile?.location ?? 'No Location'}
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                {profile?.profile?.national_identifier ?? 'No Identifier'}
              </Text>
              <Flex justify={'space-between'} align="center" h="100%">
                <Text size="sm" fw={500} tt="uppercase">
                  OVERALL RATING
                </Text>
                <Button
                  size="xs"
                  miw={90}
                  c="black"
                  bg={
                    riskColors[
                      (profile?.ratings?.supplier as keyof typeof riskColors) ??
                        'Default'
                    ]
                  }
                >
                  {profile?.ratings.supplier}
                </Button>
              </Flex>
            </Card>

            <Card shadow="sm" radius="md" withBorder mt="md">
              {overviewRatings.map((rating) => (
                <Flex
                  key={rating.key}
                  justify={'space-between'}
                  align="center"
                  my="xs"
                >
                  <Text size="sm" pr="xs">
                    {rating.label}
                  </Text>
                  <Button
                    size="xs"
                    miw={90}
                    c="black"
                    bg={
                      riskColors[
                        (profile?.ratings[
                          rating.key
                        ] as keyof typeof riskColors) ?? 'Default'
                      ]
                    }
                  >
                    {profile?.ratings[rating.key]}
                  </Button>
                </Flex>
              ))}
            </Card>

            <Card shadow="sm" radius="md" withBorder mt="md">
              {profile && (
                <Box>
                  {overviewFields.map(
                    (field) =>
                      profile.profile[field.key] && (
                        <Box key={field.label} mb="md">
                          <Text size="sm">{field.label}</Text>
                          {profile.profile[field.key]
                            .split(/\n+/)
                            .map((line, index) => (
                              <Text key={index} c="dimmed" size="sm">
                                {line}
                              </Text>
                            ))}
                        </Box>
                      )
                  )}
                </Box>
              )}
            </Card>
          </ScrollArea>
        </Box>
      </Grid.Col>
      <Grid.Col span={9}>
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          mt="md"
          style={{ height: '100%', minHeight: '100%' }}
        >
          {graphData.nodes.length > 0 ? (
            <Box pos="relative">
              <LoadingOverlay
                visible={isLoading}
                zIndex={1000}
                overlayProps={{
                  radius: 'sm',
                  blur: 15,
                }}
              />

              <Box style={{ width: '100%', height: '100%', minHeight: '50vh' }}>
                <MainGraph
                  graphData={graphData}
                  setSelectedNode={setSelectedNode}
                  isSubGraph={true}
                />
              </Box>
            </Box>
          ) : (
            <Box
              style={{
                display: 'grid',
                placeItems: 'center',
                height: '100%',
                minHeight: '50vh',
              }}
            >
              <Loader />
            </Box>
          )}
        </Card>
      </Grid.Col>
    </Grid>
  );
};

export default function NetworkGraph() {
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
  });

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedNodeName =
    selectedNode && graphData.nodes.length > 0
      ? graphData.nodes.find((node) => node.id === selectedNode)?.name ??
        'Selected node'
      : '';

  return (
    <MainDashboardLayout>
      <Grid>
        <Grid.Col span={3}>
          <Card
            shadow="sm"
            radius="md"
            withBorder
            mt="md"
            pr={4}
            h={`calc(100vh - 9rem)`}
          >
            <ScrollArea
              h={`calc(100vh - 7rem)`}
              w={'100%'}
              offsetScrollbars
              className="custom-modal-popup"
            >
              <Filters
                setGraphData={setGraphData}
                setIsLoading={setIsLoading}
              />
            </ScrollArea>
          </Card>
        </Grid.Col>
        <Grid.Col span={9} mb="md">
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            mt="md"
            h="100%"
          >
            {graphData.nodes.length > 0 || isLoading ? (
              <Box pos="relative" style={{ height: '100%', width: '100%' }}>
                <LoadingOverlay
                  visible={isLoading}
                  zIndex={1000}
                  overlayProps={{ radius: 'sm', blur: 15 }}
                />
                <Box style={{ width: '100%', height: '100%' }}>
                  <MainGraph
                    graphData={graphData}
                    setSelectedNode={setSelectedNode}
                  />
                </Box>
              </Box>
            ) : (
              <NoGraphData />
            )}
            <ModalPopup
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              selectedNodeName={selectedNodeName}
            />
          </Card>
        </Grid.Col>
      </Grid>
    </MainDashboardLayout>
  );
}

const NoGraphData = () => {
  return (
    <Box
      style={{
        display: 'grid',
        placeItems: 'center',
        height: '100%',
      }}
    >
      <Box>
        <Image
          src={'/illustrations/blank-canvas.svg'}
          h={300}
          w={300}
          alt="No Graph Data"
        />
        <Text c="dimmed" mt="md" ta={'center'}>
          No data available to show the graph.
          <br /> Please check your filters or try again later.
        </Text>
      </Box>
    </Box>
  );
};

function FindingsTable({ entry }: { entry: Readonly<KPIEntry> }) {
  return (
    <Table
      className="custom-table"
      withTableBorder
      withColumnBorders
      withRowBorders
      striped
      verticalSpacing="xs"
      mt="md"
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Td ta="center">{entry.kpi_definition}</Table.Td>
          <Table.Th w="15%" ta="center">
            Rating
          </Table.Th>
          <Table.Td w="15%" ta="center">
            {entry.kpi_rating}
          </Table.Td>
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        <Table.Tr>
          <Table.Th colSpan={3}>Findings</Table.Th>
        </Table.Tr>

        <Table.Tr>
          <Table.Td colSpan={3}>
            {entry.kpi_details.split(/\n+/).map((line, index) => (
              <Text key={index} size="sm">
                {line}
              </Text>
            ))}
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
}

const NoTrueHitsFound = () => {
  return (
    <Table className="custom-table" striped verticalSpacing="xs" my="md">
      <Table.Thead>
        <Table.Tr>
          <Table.Th colSpan={3} ta="center">
            No True Hits Found
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
    </Table>
  );
};
