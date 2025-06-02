import {
  SigmaContainer,
  useLoadGraph,
  ControlsContainer,
  FullScreenControl,
  ZoomControl,
  useSigma,
} from '@react-sigma/core';
import Graph from 'graphology';
import { FC, useEffect, useState } from 'react';
import {
  LayoutForceAtlas2Control,
  useWorkerLayoutForceAtlas2,
} from '@react-sigma/layout-forceatlas2';
import { GraphData } from '../../types';
import GraphEventsController from './GraphEventsController';
import GraphSettingsController from './GraphSettingsController';
import { Box, Input, Tooltip } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

const MyGraph: FC<{ graphData: GraphData; isSubGraph?: boolean }> = ({
  graphData,
  isSubGraph,
}) => {
  const loadGraph = useLoadGraph();
  const { start, stop } = useWorkerLayoutForceAtlas2();

  useEffect(() => {
    // Create the graph
    const graph = new Graph();

    const values = graphData.nodes.map((n) => n.node_size ?? 0);
    const minSize = isSubGraph ? 10 : 5;
    const maxSize = 25;

    let minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    graphData.nodes.forEach((node) => {
      const normalizedSize =
        ((node.node_size ?? 0 - minVal) / (maxVal - minVal)) *
          (maxSize - minSize) +
        minSize;

      graph.addNode(node.id, {
        label: node.name,
        size: graphData.nodes.length === 1 ? 30 : normalizedSize,
        x: Math.random(),
        y: Math.random(),
        color: node.node_colour,
        ...node,
      });
    });

    graphData.edges.forEach((link, index) => {
      graph.addEdgeWithKey(`edge-${index}`, link.target, link.source, {
        label: link.relationship_type.replace('SUPPLIER', ' '),
        size: 1,
      });
    });

    loadGraph(graph);

    start();

    const timeout = setTimeout(() => {
      stop();
    }, 2000);

    return () => {
      clearTimeout(timeout);
      // kill();
    };
  }, [loadGraph, graphData]);

  return null;
};

const SearchGraph = () => {
  const [value, setValue] = useState<string>('');
  const sigma = useSigma();

  const [debouncedValue] = useDebouncedValue(value, 1000);

  useEffect(() => {
    if (debouncedValue.length > 2) {
      let matchFound = false;
      sigma.getGraph().forEachNode((node, attr) => {
        const nodeLabel = attr.label.toLowerCase();
        const nodeLocation = attr.location?.toLowerCase() ?? '';
        const nodeTradeRegisterNumber =
          attr.national_identifier?.toLowerCase() ?? '';

        const searchValue = debouncedValue.toLowerCase();
        if (
          nodeLabel.includes(searchValue) ||
          nodeLocation.includes(searchValue) ||
          nodeTradeRegisterNumber.includes(searchValue)
        ) {
          matchFound = true;
          sigma.getGraph().setNodeAttribute(node, 'highlighted', true);
        } else {
          sigma.getGraph().setNodeAttribute(node, 'highlighted', false);
        }
      });

      if (!matchFound) {
        notifications.show({
          title: 'No Match',
          message: `"${debouncedValue}" didn’t match any nodes`,
          color: 'yellow',
          position: 'top-right',
        });
      }
    } else {
      sigma.getGraph().forEachNode((node) => {
        sigma.getGraph().setNodeAttribute(node, 'highlighted', false);
      });
    }
  }, [debouncedValue, sigma]);

  return (
    <Box className="input-container" style={{ width: 'fit-content' }}>
      <Tooltip
        multiline
        w={'15rem'}
        position="bottom-end"
        withArrow
        transitionProps={{ duration: 200 }}
        disabled={debouncedValue.length < 3}
        label="Type to search by company name, location, or trade register number — the graph will auto-highlight close matches"
      >
        <Input
          className="expand-on-focus"
          placeholder="Search on Graph"
          value={value}
          onChange={(e) => {
            setValue(e.currentTarget?.value);
          }}
          leftSection={<IconSearch size={16} />}
          rightSection={
            value !== '' ? (
              <Input.ClearButton onClick={() => setValue('')} />
            ) : undefined
          }
          rightSectionPointerEvents="auto"
        />
      </Tooltip>
    </Box>
  );
};

export default function MainGraph({
  graphData,
  setSelectedNode,
  isSubGraph = false,
}: Readonly<{
  graphData: GraphData;
  setSelectedNode: React.Dispatch<React.SetStateAction<string | null>>;
  isSubGraph?: boolean;
}>) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <SigmaContainer
      settings={{
        allowInvalidContainer: true,
        defaultEdgeType: 'arrow',
        zIndex: true,
        labelRenderedSizeThreshold: isSubGraph ? undefined : 15,
      }}
    >
      <MyGraph graphData={graphData} isSubGraph={isSubGraph} />
      <GraphEventsController
        setHoveredNode={setHoveredNode}
        setSelectedNode={setSelectedNode}
      />
      <GraphSettingsController hoveredNode={hoveredNode} />
      <ControlsContainer position={'top-right'}>
        <SearchGraph />
      </ControlsContainer>
      <ControlsContainer position={'bottom-right'}>
        <ZoomControl />
        <FullScreenControl />
        <LayoutForceAtlas2Control autoRunFor={2000} />
      </ControlsContainer>
    </SigmaContainer>
  );
}
