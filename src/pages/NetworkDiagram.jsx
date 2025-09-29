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
import {
  fetchOlts,
  fetchData,
  getDescendants,
  saveNodeInfo,
  copyNodeInfo,
  deleteNode,
  deleteEdge,
} from "../utils/graphUtils";

import EditFab from "../components/ui/EditFab.jsx";
import CustomNode from "../components/CustomNode.jsx";
import ContextMenu from "../components/ContextMenu.jsx";
import HelpBox from "../components/ui/HelpBox.jsx";
import SearchControl from "../components/ui/SearchControl.jsx";
import AddNodeModal from "../components/modals/AddNodeModal.jsx";
import EditNodeModal from "../components/modals/EditNodeModal.jsx";
import ConfirmDeleteModal from "../components/modals/ConfirmDeleteModal.jsx";
import LoadingOverlay from "../components/ui/LoadingOverlay.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import OltSelector from "../components/ui/OltSelector.jsx";

const nodeTypes = { custom: CustomNode };
const NODES_PER_COLUMN = 8; // Renamed from NODES_PER_ROW
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
  const [isEmpty, setIsEmpty] = useState(false);
  const [olts, setOlts] = useState([]); // For the dropdown list
  const [selectedOlt, setSelectedOlt] = useState(null); // The chosen OLT ID
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
  const [newConnections, setNewConnections] = useState([]); // <-- ADD THIS LINE
  const [insertionEdge, setInsertionEdge] = useState(null);
  const edgeUpdateSuccessful = useRef(true);

  const getSortableNumbers = (label = "") => {
    const matches = label.match(/\d+/g); // Finds all sequences of digits
    return matches ? matches.map(Number) : []; // Converts them to numbers
  };

  const compareNodesByLabel = (a, b) => {
    const numsA = getSortableNumbers(a.data.label);
    const numsB = getSortableNumbers(b.data.label);
    for (let i = 0; i < Math.min(numsA.length, numsB.length); i++) {
      if (numsA[i] !== numsB[i]) return numsA[i] - numsB[i];
    }
    return numsA.length - numsB.length;
  };

  const onConnect = useCallback(
    (params) => {
      // Find the source and target nodes from the main 'nodes' state
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      // Create the edge for immediate visual feedback in all cases
      const newEdge = {
        ...params,
        id: `e-${params.source}-${params.target}`, // More unique ID
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      setEdges((eds) => addEdge(newEdge, eds));

      // Check if we are connecting a PON ('default' icon) to an ONU ('output' icon)
      if (
        sourceNode?.data?.icon === "default" &&
        targetNode?.data?.icon === "output"
      ) {
        // This is a connection we want to save, so add it to the pending list
        setNewConnections((prevConnections) => [...prevConnections, params]);
      }
    },
    [nodes, setEdges, setNewConnections] // Add `nodes` to the dependency array
  );

  const handleFabClick = useCallback(async () => {
    // If we are currently in edit mode, this click means "save and lock"
    console.log("fab1");
    if (isEditMode) {
      console.log("fab2");
      console.log(newConnections);
      if (newConnections.length > 0) {
        console.log("fab3");
        setLoading(true);
        try {
          // Create a list of all API calls to run
          const savePromises = newConnections.map((conn) => {
            const newParentId = parseInt(conn.source, 10);
            const sourceNodeId = parseInt(conn.target, 10);
            return copyNodeInfo(sourceNodeId, newParentId);
          });

          // Run all API calls in parallel
          await Promise.all(savePromises);

          // Clear the pending connections list on success
          setNewConnections([]);

          // Reload the diagram to show the permanent, saved state
          const currentOlt = selectedOlt;
          setSelectedOlt(null);
          setTimeout(() => setSelectedOlt(currentOlt), 50);
        } catch (error) {
          console.error("Failed to save new connections:", error);
          // On error, don't exit edit mode, so the user can see the issue
          setLoading(false);
          return; // Stop execution here
        }
      }
    }
    // This will now only run on success or if there were no new connections
    setIsEditMode((prevMode) => !prevMode);
  }, [isEditMode, newConnections, selectedOlt]); // <-- Add dependencies

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
  const handleConfirmDelete = useCallback(async () => {
    const { id, type } = deleteModal;
    setLoading(true);

    try {
      if (type === "device") {
        // Find the node in the state to get its name from the 'data' object
        const nodeToDelete = nodes.find((n) => n.id === id);

        if (nodeToDelete) {
          // Construct the new payload with name and the currently selected OLT ID
          const nodeInfo = {
            name: nodeToDelete.data.name,
            sw_id: parseInt(selectedOlt, 10),
          };
          await deleteNode(nodeInfo);
        } else {
          throw new Error("Node to delete was not found in the current state.");
        }
      } else {
        // This is an edge deletion
        const edgeToDelete = edges.find((e) => e.id === id);
        // Find the target node to get its NAME
        const targetNode = nodes.find((n) => n.id === edgeToDelete.target);

        if (edgeToDelete && targetNode) {
          // Construct the NEW payload for the API
          const edgeInfo = {
            name: targetNode.data.name, // Use the node's unique name
            source_id: parseInt(edgeToDelete.source, 10),
            sw_id: parseInt(selectedOlt, 10),
          };
          await deleteEdge(edgeInfo);
        }
      }

      // On success, reload the diagram to reflect the change
      const currentOlt = selectedOlt;
      setSelectedOlt(null);
      setTimeout(() => setSelectedOlt(currentOlt), 50);
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
      // Error toast is shown in graphUtils, so just stop the loading indicator
    } finally {
      setDeleteModal({ isOpen: false, id: null, type: "" });
      // setLoading will be turned off by the data reload effect
    }
  }, [deleteModal, edges, nodes, selectedOlt]); // <-- Add 'nodes' to the dependency array
  const handleUpdateNodeLabel = useCallback(
    async (nodeId, updatedFormData) => {
      setLoading(true);
      try {
        // Find the original node from the state to get its original name
        const nodeToUpdate = nodes.find((n) => n.id === nodeId);
        if (!nodeToUpdate) {
          throw new Error("Node to update not found.");
        }

        // Prepare the payload for the API
        const payload = {
          ...updatedFormData, // This includes the new name and any other fields
          original_name: nodeToUpdate.data.name, // The name BEFORE the edit
          sw_id: parseInt(selectedOlt, 10),
        };

        await saveNodeInfo(nodeId, payload);

        // --- CRITICAL STEP ---
        // On success, trigger a full reload to apply all layout logic correctly
        const currentOlt = selectedOlt;
        setSelectedOlt(null);
        setTimeout(() => setSelectedOlt(currentOlt), 50);
      } catch (error) {
        console.error("Error saving node info:", error);
        // The error toast is handled in graphUtils
      } finally {
        // setLoading is turned off by the data reload effect
      }
    },
    [nodes, selectedOlt]
  ); // Add dependencies

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

  // 1. Fetch the list of OLTs ONCE on initial mount
  useEffect(() => {
    if (localStorage.getItem("selectedOlt")) {
      setSelectedOlt(localStorage.getItem("selectedOlt"));
    }
    const getOltList = async () => {
      try {
        const oltList = await fetchOlts();
        setOlts(oltList || []);
      } catch (error) {
        console.error("Failed to load OLT list.", error);
      }
    };
    getOltList();
  }, []); // Empty array ensures this runs only once

  useEffect(() => {
    if (!selectedOlt) {
      setNodes([]);
      setEdges([]);
      setIsEmpty(true);
      return; // Do nothing if no OLT is selected
    }
    localStorage.setItem("selectedOlt", selectedOlt); // Save selection
    const loadInitialData = async () => {
      setLoading(true);
      setIsEmpty(false);
      try {
        const apiData = await fetchData(selectedOlt); // Use the selected OLT
        if (!apiData || apiData.length === 0) {
          setIsEmpty(true);
          setNodes([]);
          setEdges([]);
          setLoading(false);
          return;
        }

        // --- NEW DE-DUPLICATION LOGIC STARTS HERE ---

        const uniqueNodesMap = new Map();
        const macToNodeIdMap = new Map();

        // First, add all non-ONU nodes (OLTs and PONs), which are always unique by ID
        apiData.forEach((item) => {
          if (item.node_type !== "ONU") {
            uniqueNodesMap.set(String(item.id), item);
          }
        });

        // Group all ONU records by their MAC address
        const onuRecordsByMac = {};
        apiData.forEach((item) => {
          if (item.node_type === "ONU" && item.mac) {
            if (!onuRecordsByMac[item.mac]) {
              onuRecordsByMac[item.mac] = [];
            }
            onuRecordsByMac[item.mac].push(item);
          }
        });

        // For each group of ONUs with the same MAC, find the "primary" record
        for (const mac in onuRecordsByMac) {
          const records = onuRecordsByMac[mac];
          let primaryRecord = records[0]; // Start with the first as a fallback

          // Find the best record to represent the node's data
          for (const record of records) {
            const parentNode = uniqueNodesMap.get(String(record.parent_id));
            // A record is "primary" if the parent's name is part of the child's name
            if (parentNode && record.name.startsWith(parentNode.name)) {
              primaryRecord = record;
              break; // Found the ideal record, so we can stop looking
            }
          }

          // Now, use this chosen primary record for the unique node
          uniqueNodesMap.set(String(primaryRecord.id), primaryRecord);
          macToNodeIdMap.set(mac, String(primaryRecord.id));
        }

        // Create edges for ALL connections, mapping them to the primary node ID
        const initialEdges = [];
        apiData.forEach((item) => {
          if (item.parent_id !== null && item.parent_id !== 0) {
            let targetId =
              item.mac && item.node_type === "ONU"
                ? macToNodeIdMap.get(item.mac)
                : String(item.id);

            initialEdges.push({
              id: `e-${item.id}`, // Unique ID for each connection record
              source: String(item.parent_id),
              target: targetId,
              sourceHandle: "right",
              targetHandle: "left",
              markerEnd: { type: MarkerType.ArrowClosed },
              style: { stroke: item.cable_color || "#b1b1b7" },
            });
          }
        });

        // Create the final list of unique nodes for React Flow
        const initialNodes = Array.from(uniqueNodesMap.values()).map(
          (item) => ({
            id: macToNodeIdMap.get(item.mac) || String(item.id), // Use the primary ID
            type: "custom",
            data: {
              ...item,
              label: item.name || item.mac || `Node ${item.id}`,
              icon:
                item.node_type === "OLT"
                  ? "input"
                  : item.node_type === "PON"
                  ? "default"
                  : "output",
            },
            position: { x: 0, y: 0 },
          })
        );

        // --- Layout logic with the new fix ---
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

        // 1. ADD THIS SET to track which nodes have been positioned
        const positionedOnuIds = new Set();

        const onusByPrimaryParent = {};
        nodesWithFinalLayout.forEach((node) => {
          // Check if the node is an ONU and has a parent_id in its data
          if (node.data.icon === "output" && node.data.parent_id) {
            const parentId = String(node.data.parent_id);
            if (!onusByPrimaryParent[parentId]) {
              onusByPrimaryParent[parentId] = [];
            }
            onusByPrimaryParent[parentId].push(node);
          }
        });

        Object.values(ponNodesByParent).forEach((ponGroup) => {
          ponGroup.sort(compareNodesByLabel);

          ponGroup.forEach((parentNode) => {
            let onuGroup = onusByPrimaryParent[parentNode.id] || [];
            onuGroup.sort(compareNodesByLabel);

            // 2. FILTER the group to only include ONUs that haven't been placed yet
            const unpositionedOnuGroup = onuGroup.filter(
              (onu) => !positionedOnuIds.has(onu.id)
            );

            if (unpositionedOnuGroup.length > 0) {
              const startX = parentNode.position.x + GRID_X_SPACING;
              const startY = currentYOffset;

              unpositionedOnuGroup.forEach((node, index) => {
                const row = index % NODES_PER_COLUMN;
                const column = Math.floor(index / NODES_PER_COLUMN);
                node.position = {
                  x: startX + column * GRID_X_SPACING,
                  y: startY + row * GRID_Y_SPACING,
                };
                // 3. RECORD that this node's position is now set
                positionedOnuIds.add(node.id);
              });

              const numRows = Math.min(
                unpositionedOnuGroup.length,
                NODES_PER_COLUMN
              );
              const gridHeight = (numRows - 1) * GRID_Y_SPACING + nodeHeight;
              parentNode.position.y = startY + (gridHeight - nodeHeight) / 2;
              currentYOffset += gridHeight + PADDING_BETWEEN_GRIDS;
            } else {
              parentNode.position.y = currentYOffset;
              currentYOffset += nodeHeight + PADDING_BETWEEN_GRIDS;
            }
          });
        });

        // 1. Find all ONU nodes that were NOT positioned by the main loop
        const allOnuNodes = nodesWithFinalLayout.filter(
          (n) => n.data.icon === "output"
        );
        const orphanedOnus = allOnuNodes.filter(
          (n) => !positionedOnuIds.has(n.id)
        );

        // 2. If there are any orphans, place them in a separate grid at the bottom
        if (orphanedOnus.length > 0) {
          orphanedOnus.sort(compareNodesByLabel);

          // Define how many orphans should appear in one horizontal row
          const ORPHANS_PER_ROW = 6;

          const startX = oltNode ? oltNode.position.x : 0;
          const startY = currentYOffset + PADDING_BETWEEN_GRIDS * 2;

          orphanedOnus.forEach((node, index) => {
            // THIS MATH IS NOW CORRECT FOR HORIZONTAL ROWS
            const column = index % ORPHANS_PER_ROW;
            const row = Math.floor(index / ORPHANS_PER_ROW);

            node.position = {
              x: startX + column * GRID_X_SPACING, // 'column' determines X position
              y: startY + row * GRID_Y_SPACING, // 'row' determines Y position
            };
            positionedOnuIds.add(node.id); // Mark the orphan as positioned
          });
        }

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
  }, [setNodes, setEdges, selectedOlt]);

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
        <Background variant="dots" gap={12} size={1} />
        {contextMenu && (
          <ContextMenu {...contextMenu} onAction={handleAction} />
        )}
      </ReactFlow>

      {loading && <LoadingOverlay />}
      {!loading && isEmpty && <EmptyState />}

      <OltSelector
        olts={olts}
        selectedOlt={selectedOlt}
        onChange={setSelectedOlt}
        isLoading={loading}
      />

      {!isEmpty && (
        <>
          <EditFab isEditing={isEditMode} onClick={handleFabClick} />
          <SearchControl nodes={nodes} onNodeFound={onNodeFound} />
          <HelpBox />
        </>
      )}

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
    </div>
  );
};

export default NetworkDiagram;
