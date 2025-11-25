import { useState, useEffect, useMemo } from "react";
import { useNodesState, useEdgesState, MarkerType } from "reactflow";
import { fetchData, getDescendants } from "../utils/nodeHelpers";
import { getLayoutedElements } from "../utils/layout";
import {
  NODES_PER_ROW,
  GRID_X_SPACING,
  GRID_Y_SPACING,
  PADDING_BETWEEN_GRIDS,
} from "../utils/constants";
import { MISC } from "../utils/enums";

const useNetworkLayout = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [visibleNodes, setVisibleNodes] = useState([]);
  const [visibleEdges, setVisibleEdges] = useState([]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const apiData = await fetchData();
        if (!apiData) return;

        const initialNodes = apiData.map((item) => ({
          id: String(item.id),
          type: "custom",
          data: {
            label: item.name || item.mac || `Node ${item.id}`,
          },
          position: { x: 0, y: 0 },
        }));

        const initialEdges = apiData
          .filter((item) => item.parent_id !== null && item.parent_id !== 0)
          .map((item) => ({
            id: `e-${item.parent_id}-${item.id}`,
            source: String(item.parent_id),
            target: String(item.id),
            sourceHandle: "right",
            targetHandle: "left",
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: item.cable_color || "#1e293b", strokeWidth: 3 },
          }));

        const { nodes: dagreLayoutedNodes, edges: layoutedEdges } =
          getLayoutedElements(initialNodes, initialEdges);

        const nodesWithFinalLayout = [...dagreLayoutedNodes];

        const ponNodesByParent = {};
        const oltNode = nodesWithFinalLayout.find(
          (n) => n.data.icon === MISC.INPUT
        );

        layoutedEdges.forEach((edge) => {
          if (edge.source === oltNode?.id) {
            const targetNode = nodesWithFinalLayout.find(
              (n) => n.id === edge.target
            );
            if (targetNode && targetNode.data.icon === MISC.DEFAULT) {
              if (!ponNodesByParent[edge.source]) {
                ponNodesByParent[edge.source] = [];
              }
              ponNodesByParent[edge.source].push(targetNode);
            }
          }
        });

        let currentYOffset = 0;
        const nodeHeight = 60;

        Object.values(ponNodesByParent).forEach((ponGroup) => {
          ponGroup.sort((a, b) => a.position.y - b.position.y);
          ponGroup.forEach((parentNode) => {
            const onuGroup = layoutedEdges
              .filter((e) => e.source === parentNode.id)
              .map((e) => nodesWithFinalLayout.find((n) => n.id === e.target));

            if (onuGroup.length > 0) {
              const startX = parentNode.position.x + GRID_X_SPACING;
              const startY = currentYOffset;

              onuGroup.forEach((node, index) => {
                if (!node) return;
                const column = index % NODES_PER_ROW;
                const row = Math.floor(index / NODES_PER_ROW);
                node.position = {
                  x: startX + column * GRID_X_SPACING,
                  y: startY + row * GRID_Y_SPACING,
                };
              });

              const numRows = Math.ceil(onuGroup.length / NODES_PER_ROW) || 1;
              const gridHeight = (numRows - 1) * GRID_Y_SPACING + nodeHeight;
              parentNode.position.y = startY + (gridHeight - nodeHeight) / 2;
              currentYOffset += gridHeight + PADDING_BETWEEN_GRIDS;
            } else {
              parentNode.position.y = currentYOffset;
              currentYOffset += nodeHeight + PADDING_BETWEEN_GRIDS;
            }
          });
        });

        if (oltNode && ponNodesByParent[oltNode.id]) {
          const ponNodes = ponNodesByParent[oltNode.id];
          const yPositions = ponNodes.map((n) => n.position.y);
          const minY = Math.min(...yPositions);
          const maxY = Math.max(...yPositions);
          if (oltNode) {
            oltNode.position.y = minY + (maxY - minY) / 2;
          }
        }
        setNodes(nodesWithFinalLayout);
        setEdges(layoutedEdges);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [setNodes, setEdges]);

  useMemo(() => {
    const allNodes = nodes.map((node) => {
      const isCollapsible = edges.some((edge) => edge.source === node.id);
      return { ...node, data: { ...node.data, isCollapsible } };
    });

    const hidden = { nodeIds: new Set(), edgeIds: new Set() };
    for (const node of allNodes) {
      if (node.data?.isCollapsed) {
        const { hiddenNodeIds, hiddenEdgeIds } = getDescendants(
          node.id,
          allNodes,
          edges
        );
        hiddenNodeIds.forEach((id) => hidden.nodeIds.add(id));
        hiddenEdgeIds.forEach((id) => hidden.edgeIds.add(id));
      }
    }

    setVisibleNodes(allNodes.filter((n) => !hidden.nodeIds.has(n.id)));
    setVisibleEdges(
      edges.filter(
        (e) =>
          !hidden.edgeIds.has(e.id) &&
          !hidden.nodeIds.has(e.source) &&
          !hidden.nodeIds.has(e.target)
      )
    );
  }, [nodes, edges]);

  return {
    nodes,
    edges,
    loading,
    visibleNodes,
    visibleEdges,
    onNodesChange,
    onEdgesChange,
  };
};

export default useNetworkLayout;
