import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  useReactFlow,
  MarkerType,
  reconnectEdge,
} from "reactflow";
import "reactflow/dist/style.css";

import { getLayoutedElements } from "../layout";
import { fetchData, getDescendants } from "../utils/graphUtils";

import EditFab from "../components/ui/EditFab.jsx";
import CustomNode from "../components/CustomNode.jsx";
import ContextMenu from "../components/ContextMenu.jsx";
import HelpBox from "../components/ui/HelpBox.jsx";
import SearchControl from "../components/ui/SearchControl.jsx";
import AddNodeModal from "../components/modals/AddNodeModal.jsx";
import EditNodeModal from "../components/modals/EditNodeModal.jsx";
import ConfirmDeleteModal from "../components/modals/ConfirmDeleteModal.jsx";

const nodeTypes = { custom: CustomNode };
const NODES_PER_ROW = 8;
const GRID_X_SPACING = 300;
const GRID_Y_SPACING = 80;
const PADDING_BETWEEN_GRIDS = 50;

const NetworkDiagram = () => {
  // All of your state and logic from the original component goes here...
  // (useState, useCallback, useEffect, etc.)
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [nodeIdCounter, setNodeIdCounter] = useState(8);
  const [loading, setLoading] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [editModal, setEditModal] = useState({ isOpen: false, node: null });
  const [addModal, setAddModal] = useState({
    isOpen: false,
    position: null,
    isInsertion: false,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    type: "",
  });
  const [insertionEdge, setInsertionEdge] = useState(null);
  const edgeUpdateSuccessful = useRef(true);

  // Paste all of your handler functions here (onConnect, onEdgeUpdate, handleAction, etc.)
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            sourceHandle: "right",
            targetHandle: "left",
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      ),
    [setEdges]
  );
  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);
  const onEdgeUpdate = useCallback(
    (oldEdge, newConnection) => {
      edgeUpdateSuccessful.current = true;
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    },
    [setEdges]
  );
  const onEdgeUpdateEnd = useCallback(
    (_, edge) => {
      if (!edgeUpdateSuccessful.current) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }
      edgeUpdateSuccessful.current = true;
    },
    [setEdges]
  );
  const isValidConnection = useCallback((connection) => {
    if (connection.source === connection.target) return false;
    return (
      connection.sourceHandle === "right" && connection.targetHandle === "left"
    );
  }, []);
  const handleContextMenu = (event, type, item) => {
    event.preventDefault();
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    setContextMenu({
      id: item?.id,
      type,
      top: event.clientY - reactFlowBounds.top,
      left: event.clientX - reactFlowBounds.left,
    });
  };
  const onPaneContextMenu = (event) => handleContextMenu(event, "pane");
  const onNodeContextMenu = (event, node) =>
    handleContextMenu(event, "node", node);
  const onEdgeContextMenu = (event, edge) =>
    handleContextMenu(event, "edge", edge);
  const onPaneClick = useCallback(() => setContextMenu(null), []);
  const onNodeClick = useCallback(
    (event, node) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, data: { ...n.data, isCollapsed: !n.data?.isCollapsed } }
            : n
        )
      );
    },
    [setNodes]
  );
  const handleAction = (action, { id }) => {
    setContextMenu(null);
    switch (action) {
      case "addNode": {
        const position = reactFlowInstance.screenToFlowPosition({
          x: contextMenu.left,
          y: contextMenu.top,
        });
        setAddModal({ isOpen: true, position, isInsertion: false });
        break;
      }
      case "editNode": {
        const nodeToEdit = nodes.find((n) => n.id === id);
        if (nodeToEdit) setEditModal({ isOpen: true, node: nodeToEdit });
        break;
      }
      case "deleteNode":
        setDeleteModal({ isOpen: true, id, type: "device" });
        break;
      case "renameEdge": {
        const newLabel = prompt(
          "Enter new connection name:",
          edges.find((e) => e.id === id)?.label
        );
        setEdges((eds) =>
          eds.map((e) => (e.id === id ? { ...e, label: newLabel } : e))
        );
        break;
      }
      case "deleteEdge":
        setDeleteModal({ isOpen: true, id, type: "connection" });
        break;
      case "insertNode": {
        const edge = edges.find((e) => e.id === id);
        if (edge) {
          setInsertionEdge(edge);
          setAddModal({ isOpen: true, position: null, isInsertion: true });
        }
        break;
      }
    }
  };
  const handleAddNodeSave = (name, type, position) => {
    const newId = `node-${nodeIdCounter}`;
    setNodeIdCounter((c) => c + 1);
    if (addModal.isInsertion && insertionEdge) {
      const sourceNode = nodes.find((n) => n.id === insertionEdge.source);
      const targetNode = nodes.find((n) => n.id === insertionEdge.target);
      if (!sourceNode || !targetNode) return;
      const newPosition = {
        x: (sourceNode.position.x + targetNode.position.x) / 2,
        y: (sourceNode.position.y + targetNode.position.y) / 2,
      };
      const intermediateNode = {
        id: newId,
        type: "custom",
        position: newPosition,
        data: { label: name, icon: type },
      };
      const edgeTo = {
        id: `e-${insertionEdge.source}-${newId}`,
        source: insertionEdge.source,
        sourceHandle: "right",
        target: newId,
        targetHandle: "left",
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      const edgeFrom = {
        id: `e-${newId}-${insertionEdge.target}`,
        source: newId,
        sourceHandle: "right",
        target: insertionEdge.target,
        targetHandle: "left",
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      setNodes((nds) => nds.concat(intermediateNode));
      setEdges((eds) =>
        eds.filter((e) => e.id !== insertionEdge.id).concat([edgeTo, edgeFrom])
      );
      setInsertionEdge(null);
    } else {
      const newNode = {
        id: newId,
        type: "custom",
        position,
        data: { label: name, icon: type },
      };
      setNodes((nds) => nds.concat(newNode));
    }
  };
  const handleConfirmDelete = () => {
    const { id, type } = deleteModal;
    if (type === "device") {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    } else {
      setEdges((eds) => eds.filter((e) => e.id !== id));
    }
    setDeleteModal({ isOpen: false, id: null, type: "" });
  };
  const handleUpdateNodeLabel = (nodeId, newLabel) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, label: newLabel } } : n
      )
    );
  };
  const onNodeFound = (nodeId) => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, isHighlighted: n.id === nodeId },
      }))
    );
    reactFlowInstance.fitView({
      nodes: [{ id: nodeId }],
      duration: 500,
      maxZoom: 1.5,
    });
    setTimeout(() => {
      setNodes((nds) =>
        nds.map((n) => ({ ...n, data: { ...n.data, isHighlighted: false } }))
      );
    }, 3000);
  };
  const { visibleNodes, visibleEdges } = useMemo(() => {
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
    return {
      visibleNodes: allNodes.filter((n) => !hidden.nodeIds.has(n.id)),
      visibleEdges: edges.filter(
        (e) =>
          !hidden.edgeIds.has(e.id) &&
          !hidden.nodeIds.has(e.source) &&
          !hidden.nodeIds.has(e.target)
      ),
    };
  }, [nodes, edges]);
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
            icon:
              item.node_type === "OLT"
                ? "input"
                : item.node_type === "PON"
                ? "default"
                : "output",
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
            style: { stroke: item.cable_color || "#b1b1b7" },
          }));
        const { nodes: dagreLayoutedNodes, edges: layoutedEdges } =
          getLayoutedElements(initialNodes, initialEdges);
        const nodesWithFinalLayout = [...dagreLayoutedNodes];
        const ponNodesByParent = {};
        const oltNode = nodesWithFinalLayout.find(
          (n) => n.data.icon === "input"
        );
        layoutedEdges.forEach((edge) => {
          if (edge.source === oltNode?.id) {
            const targetNode = nodesWithFinalLayout.find(
              (n) => n.id === edge.target
            );
            if (targetNode && targetNode.data.icon === "default") {
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
          oltNode.position.y = minY + (maxY - minY) / 2;
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

  if (loading) {
    return <div>Loading...</div>;
  } else {
    return (
      <div style={{ width: "100vw", height: "100vh" }} ref={reactFlowWrapper}>
        <ReactFlow
          nodes={visibleNodes}
          edges={visibleEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          nodesDraggable={isEditMode}
          nodesConnectable={isEditMode}
          edgesUpdatable={isEditMode}
          panOnDrag={!isEditMode}
          onPaneClick={onPaneClick}
          onPaneContextMenu={onPaneContextMenu}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          onEdgeUpdate={onEdgeUpdate}
          onEdgeUpdateStart={onEdgeUpdateStart}
          onEdgeUpdateEnd={onEdgeUpdateEnd}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <Background variant="dots" gap={12} size={1} />
          {contextMenu && (
            <ContextMenu {...contextMenu} onAction={handleAction} />
          )}
        </ReactFlow>
        <EditFab
          isEditing={isEditMode}
          onClick={() => setIsEditMode(!isEditMode)}
        />
        <SearchControl nodes={nodes} onNodeFound={onNodeFound} />
        <EditNodeModal
          isOpen={editModal.isOpen}
          node={editModal.node}
          onClose={() => setEditModal({ isOpen: false, node: null })}
          onSave={handleUpdateNodeLabel}
        />
        <AddNodeModal
          isOpen={addModal.isOpen}
          onClose={() =>
            setAddModal({ isOpen: false, position: null, isInsertion: false })
          }
          onSave={handleAddNodeSave}
          defaultPosition={addModal.position}
          isInsertion={addModal.isInsertion}
        />
        <ConfirmDeleteModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, id: null, type: "" })}
          onConfirm={handleConfirmDelete}
          itemType={deleteModal.type}
        />
        <HelpBox />
      </div>
    );
  }
};

export default NetworkDiagram;
