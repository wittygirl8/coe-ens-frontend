import { useDebouncedValue } from '@mantine/hooks';
import { useSetSettings, useSigma } from '@react-sigma/core';
import { Attributes } from 'graphology-types';
import { FC, PropsWithChildren, useEffect } from 'react';
import { drawHover, drawLabel } from '../../utils/canvas-utils';

const NODE_FADE_COLOR = '#bbb';
const EDGE_FADE_COLOR = '#eee';

const GraphSettingsController: FC<
  PropsWithChildren<{ hoveredNode: string | null }>
> = ({ children, hoveredNode }) => {
  const sigma = useSigma();
  const setSettings = useSetSettings();
  const graph = sigma.getGraph();

  const [debouncedHoveredNode] = useDebouncedValue(hoveredNode, 40);

  useEffect(() => {
    const hoveredColor: string =
      (debouncedHoveredNode &&
        sigma.getNodeDisplayData(debouncedHoveredNode)?.color) ||
      '';

    setSettings({
      defaultDrawNodeLabel: drawLabel,
      defaultDrawNodeHover: drawHover,
      autoCenter: true,
      labelSize: 12,
      edgeLabelSize: 10,
      renderEdgeLabels: true,

      nodeReducer: (node: string, data: Attributes) => {
        if (debouncedHoveredNode) {
          return node === debouncedHoveredNode ||
            graph.hasEdge(node, debouncedHoveredNode) ||
            graph.hasEdge(debouncedHoveredNode, node)
            ? { ...data, zIndex: 1 }
            : {
                ...data,
                zIndex: 0,
                label: '',
                color: NODE_FADE_COLOR,
                image: null,
                highlighted: false,
              };
        }
        return data;
      },
      edgeReducer: (edge: string, data: Attributes) => {
        if (debouncedHoveredNode) {
          return graph.hasExtremity(edge, debouncedHoveredNode)
            ? { ...data, color: hoveredColor, size: 4 }
            : { ...data, color: EDGE_FADE_COLOR, hidden: true };
        }
        return data;
      },
    });
  }, [sigma, graph, debouncedHoveredNode]);

  /**
   * Update node and edge reducers when a node is hovered, to highlight its
   * neighborhood:
   */
  useEffect(() => {
    // const hoveredColor: string =
    //   (debouncedHoveredNode &&
    //     sigma.getNodeDisplayData(debouncedHoveredNode)?.color) ||
    //   '';

    sigma.setSetting(
      'nodeReducer',
      debouncedHoveredNode
        ? (node, data) =>
            node === debouncedHoveredNode ||
            graph.hasEdge(node, debouncedHoveredNode) ||
            graph.hasEdge(debouncedHoveredNode, node)
              ? { ...data, zIndex: 1 }
              : {
                  ...data,
                  zIndex: 0,
                  label: '',
                  color: NODE_FADE_COLOR,
                  image: null,
                  highlighted: false,
                }
        : null
    );
    sigma.setSetting(
      'edgeReducer',
      debouncedHoveredNode
        ? (edge, data) =>
            graph.hasExtremity(edge, debouncedHoveredNode)
              ? { ...data }
              : // ? { ...data, color: hoveredColor }
                { ...data, color: EDGE_FADE_COLOR, hidden: true }
        : null
    );
  }, [debouncedHoveredNode]);

  return <>{children}</>;
};

export default GraphSettingsController;
