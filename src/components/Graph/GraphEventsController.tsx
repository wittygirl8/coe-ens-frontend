import { useRegisterEvents, useSigma } from '@react-sigma/core';
import { FC, PropsWithChildren, useEffect } from 'react';

const GraphEventsController: FC<
  PropsWithChildren<{
    setHoveredNode: (node: string | null) => void;
    setSelectedNode?: (node: string | null) => void;
  }>
> = ({ setHoveredNode, children, setSelectedNode }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const registerEvents = useRegisterEvents();

  /**
   * Initialize here settings that require to know the graph and/or the sigma
   * instance:
   */
  useEffect(() => {
    registerEvents({
      clickNode({ node }) {
        const attributes = graph.getNodeAttributes(node);
        if (attributes['node_category'] === 'direct') {
          // Exit fullscreen if active
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }

          if (setSelectedNode) {
            setSelectedNode(node);
          }
        }
      },
      enterNode({ node }) {
        setHoveredNode(node);
        const attributes = graph.getNodeAttributes(node);
        if (attributes['node_category'] === 'direct') {
          sigma.getContainer().style.cursor = 'pointer';
        }
      },
      leaveNode() {
        sigma.getContainer().style.cursor = 'default';
        setHoveredNode(null);
      },
    });
  }, []);

  return <>{children}</>;
};

export default GraphEventsController;
