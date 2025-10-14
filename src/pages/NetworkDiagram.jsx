/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
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
  Background,
  useReactFlow,
  MarkerType,
  reconnectEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { FaChevronLeft } from "react-icons/fa6";
import {
  fetchData,
  getDescendants,
  saveNodeInfo,
  copyNodeInfo,
  deleteNode,
  deleteEdge,
  createNode,
  insertNode,
  resetPositions,
} from "../utils/graphUtils";
import AddNodeFab from "../components/ui/AddNodeFab.jsx";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import SelectRootNodeFab from "../components/ui/SelectRootNodeFab.jsx";
import EditFab from "../components/ui/EditFab.jsx";
import CustomNode from "../components/CustomNode.jsx";
import ContextMenu from "../components/ContextMenu.jsx";
import HelpBox from "../components/ui/HelpBox.jsx";
import SearchControl from "../components/ui/SearchControl.jsx";
import NodeDetailModal from "../components/modals/NodeDetailModal.jsx";
import AddNodeModal from "../components/modals/AddNodeModal.jsx";
import EditNodeModal from "../components/modals/EditNodeModal.jsx";
import ConfirmResetModal from "../components/modals/ConfirmResetModal.jsx";
import ConfirmDeleteModal from "../components/modals/ConfirmDeleteModal.jsx";
import LoadingOverlay from "../components/ui/LoadingOverlay.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ResetPositionsFab from "../components/ui/ResetPositionsFab.jsx";

import { toast } from "react-toastify";

const nodeTypes = { custom: CustomNode };
const NODES_PER_COLUMN = 8;
const GRID_X_SPACING = 300;
const GRID_Y_SPACING = 80;
const PADDING_BETWEEN_GRIDS = 50;
const NODE_WIDTH = 250; // Approximate width of your custom node
const NODE_HEIGHT = 60;

const NetworkDiagram = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef(null);
  const initialNodesRef = useRef([]);
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirectInfo, setRedirectInfo] = useState({
    shouldRedirect: false,
    message: "",
  });
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [dynamicRootId, setDynamicRootId] = useState(() => {
    // Only read from localStorage if on the general view page
    return id ? null : localStorage.getItem("dynamicRootId");
  });
  const [isEmpty, setIsEmpty] = useState(false);
  const [rootId, setRootId] = useState(undefined);
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
  const [detailModal, setDetailModal] = useState({ isOpen: false, node: null });
  const [resetConfirmModal, setResetConfirmModal] = useState({
    isOpen: false,
    scope: null,
    nodeId: null,
    nodeName: "", // <-- ADD THIS LINE
  });
  const [newConnections, setNewConnections] = useState([]);
  const [insertionEdge, setInsertionEdge] = useState(null);
  const edgeUpdateSuccessful = useRef(true);
  const [refetchIndex, setRefetchIndex] = useState(0);
  const forceRefetch = () => setRefetchIndex((i) => i + 1);
  const getNodeIcon = (nodeType) => {
    switch (nodeType) {
      case "AP":
        return "ap";
      case "Bamboo":
        return "bamboo";
      case "Managed Switch":
        return "mswitch";
      case "OLT":
        return "olt";
      case "ONU":
        return "onu";
      case "PON":
        return "pon";
      case "Router":
        return "router";
      case "Splitter":
        return "splitter";
      case "TJ":
        return "tj";
      case "Unmanaged Switch":
        return "uswitch";
      case "Other":
        return "other";
      default:
        return "other";
    }
  };

  // --- 2. Create the callback functions for the node buttons ---
  const handleDetailsClick = (nodeData) => {
    setDetailModal({ isOpen: true, node: { data: nodeData } });
  };

  const handleNavigateClick = (nodeId) => {
    navigate(`/${nodeId}`);
  };

  const handleAddNodeClick = () => {
    // Get the center of the current viewport
    const viewportBounds = reactFlowWrapper.current.getBoundingClientRect();
    const targetPosition = {
      x: viewportBounds.width / 2,
      y: viewportBounds.height / 2,
    };

    // Convert screen coordinates to flow coordinates
    const position = reactFlowInstance.screenToFlowPosition(targetPosition);

    // Find an available spot near the center
    const finalPosition = findAvailablePosition(position, nodes);

    // Open the modal with the calculated position
    setAddModal({
      isOpen: true,
      position: finalPosition,
      isInsertion: false,
      parentNode: null, // No parent when adding to an empty space
    });
  };

  const handleSelectRoot = (nodeId) => {
    setDynamicRootId(nodeId);
  };

  const findAvailablePosition = (desiredPosition, existingNodes) => {
    const isOccupied = (pos) => {
      for (const node of existingNodes) {
        const nodeX = node.position.x;
        const nodeY = node.position.y;
        if (
          pos.x < nodeX + NODE_WIDTH &&
          pos.x + NODE_WIDTH > nodeX &&
          pos.y < nodeY + NODE_HEIGHT &&
          pos.y + NODE_HEIGHT > nodeY
        ) {
          return true; // Collision detected
        }
      }
      return false; // Position is free
    };

    if (!isOccupied(desiredPosition)) {
      return desiredPosition; // The initial spot is perfect
    }

    // If occupied, search for a nearby spot in a spiral pattern
    const nudge = 100; // How far to move when searching for a spot
    for (let i = 1; i < 20; i++) {
      const candidates = [
        { x: desiredPosition.x + i * nudge, y: desiredPosition.y }, // Right
        { x: desiredPosition.x - i * nudge, y: desiredPosition.y }, // Left
        { x: desiredPosition.x, y: desiredPosition.y + i * nudge }, // Down
        { x: desiredPosition.x, y: desiredPosition.y - i * nudge }, // Up
      ];

      for (const candidate of candidates) {
        if (!isOccupied(candidate)) {
          return candidate; // Found an empty spot
        }
      }
    }

    return desiredPosition; // Fallback if no spot is found after 20 tries
  };

  const handleResetPositions = useCallback(
    async (scope, nodeId = null) => {
      // --- THIS IS THE FIX ---
      // The check for rootId is removed to allow resets in the general view.
      // The sw_id is now correctly set to null if rootId is not present.
      try {
        const payload = {
          sw_id: rootId ? parseInt(rootId, 10) : null,
          scope: nodeId ? null : scope,
          node_id: nodeId ? parseInt(nodeId, 10) : null,
        };
        await resetPositions(payload);

        // Reload the diagram. If we are in the general view, currentOlt is null.
        forceRefetch();
      } catch (error) {
        console.error("Failed to reset positions:", error);
        setLoading(false);
      }
    },
    [rootId]
  );

  // --- 3. CREATE A HANDLER FOR THE CONFIRMATION ACTION ---
  const handleConfirmReset = useCallback(async () => {
    const { scope, nodeId } = resetConfirmModal;
    await handleResetPositions(scope, nodeId);
    setResetConfirmModal({ isOpen: false, scope: null, nodeId: null });
  }, [resetConfirmModal, handleResetPositions]);

  const getSortableNumbers = (label = "") => {
    const matches = label.match(/\d+/g); // Finds all sequences of digits
    return matches ? matches.map(Number) : []; // Converts them to numbers
  };

  const onSelectionChange = useCallback(({ nodes }) => {
    setSelectedNodes(nodes.map((node) => node.id));
  }, []); // <-- 2. ADD THIS HANDLER

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
      // Create the edge for immediate visual feedback
      const newEdge = {
        ...params,
        id: `e-${params.source}-${params.target}`,
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      setEdges((eds) => addEdge(newEdge, eds));

      // In edit mode, if the connection is valid, add it to the list to be saved.
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);
      if (isEditMode && sourceNode && targetNode) {
        setNewConnections((prevConnections) => [...prevConnections, params]);
      }
    },
    [nodes, setEdges, setNewConnections, isEditMode] // Add isEditMode to dependencies
  );

  // In NetworkDiagram.jsx

  const handleFabClick = useCallback(async () => {
    if (isEditMode) {
      // --- This block handles SAVING and EXITING edit mode ---
      setLoading(true); // Show spinner immediately on save attempt

      const originalNodes = initialNodesRef.current;
      const currentNodes = reactFlowInstance.getNodes();
      const originalNodeMap = new Map(
        originalNodes.map((node) => [node.id, node])
      );

      const movedNodes = currentNodes.filter((currentNode) => {
        const originalNode = originalNodeMap.get(currentNode.id);
        return (
          originalNode &&
          (currentNode.position.x !== originalNode.position.x ||
            currentNode.position.y !== originalNode.position.y)
        );
      });

      if (movedNodes.length > 0 || newConnections.length > 0) {
        // If there are changes, attempt to save them.
        try {
          const connectionPromises = newConnections.map((conn) => {
            const newParentId = parseInt(conn.source, 10);
            const sourceNodeId = parseInt(conn.target, 10);
            return copyNodeInfo(sourceNodeId, newParentId);
          });

          const positionSavePromises = movedNodes.map((node) => {
            const payload = {
              original_name: node.data.name,
              sw_id: node.data.sw_id,
              position_x: node.position.x,
              position_y: node.position.y,
              position_mode: 1,
            };
            return saveNodeInfo(payload, true);
          });

          await Promise.all([...connectionPromises, ...positionSavePromises]);

          // On success, clear pending changes and reload.
          setNewConnections([]);
          forceRefetch();
          // We don't need to setLoading(false) or setIsEditMode(false) because the reload will reset the state.
        } catch (error) {
          console.error("Failed to save changes:", error);
          setLoading(false); // On error, stop loading and STAY in edit mode.
        }
      } else {
        // If there were no changes to save, just exit edit mode.
        setLoading(false);
        setIsEditMode(false);
      }
    } else {
      // --- This block handles ENTERING edit mode ---
      setIsEditMode(true);
    }
  }, [isEditMode, newConnections, rootId, reactFlowInstance]);

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
      // If we are in edit mode, do nothing. This allows dragging to work without being interrupted.
      if (isEditMode) {
        return;
      }

      // Your existing collapse/expand logic will now only run when NOT in edit mode.
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, data: { ...n.data, isCollapsed: !n.data?.isCollapsed } }
            : n
        )
      );
    },
    [setNodes, isEditMode] // <-- Add isEditMode to the dependency array
  );
  const handleAction = (action, { id }) => {
    setContextMenu(null);
    switch (action) {
      case "addNode": {
        const position = reactFlowInstance.screenToFlowPosition({
          x: contextMenu.left,
          y: contextMenu.top,
        });
        // --- THIS IS THE FIX ---
        // Find an available spot *before* opening the modal
        const finalPosition = findAvailablePosition(position, nodes);
        const parentNode = nodes.find((n) => n.id === id);
        setAddModal({
          isOpen: true,
          position: finalPosition,
          isInsertion: false,
          parentNode,
        });
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
      case "deleteEdge":
        setDeleteModal({ isOpen: true, id, type: "connection" });
        break;
      case "insertNode": {
        const edge = edges.find((e) => e.id === id);
        if (edge) {
          setInsertionEdge(edge);
          setAddModal({
            isOpen: true,
            position: null,
            isInsertion: true,
            parentNode: null,
          });
        }
        break;
      }
      case "resetPosition": {
        const nodeToReset = nodes.find((n) => n.id === id);
        setResetConfirmModal({
          isOpen: true,
          scope: null,
          nodeId: id,
          nodeName: nodeToReset ? nodeToReset.data.label : "", // Find and store the name
        });
        break;
      }
    }
  };

  const handleAddNodeSave = useCallback(
    async (formData, position) => {
      // <-- Note the new 'position' parameter
      try {
        const { parentNode, isInsertion } = addModal;
        if (addModal.isInsertion && insertionEdge) {
          // The edge ID from React Flow is 'e-DATABASE_ID'. We need the number part.
          const originalEdgeRecordId = parseInt(
            insertionEdge.id.replace("e-", ""),
            10
          );

          const sourceNode = nodes.find((n) => n.id === insertionEdge.source);
          const swId = sourceNode ? sourceNode.data.sw_id : null;

          const payload = {
            new_node_data: {
              ...formData,
              cable_color: insertionEdge.style?.stroke || null,
              sw_id: swId,
            },
            original_source_id: parseInt(insertionEdge.source, 10),
            original_edge_record_id: originalEdgeRecordId, // Send the record ID
          };

          await insertNode(payload);
        } else {
          // --- THIS IS THE FIX ---
          // This is a regular ADD operation, now with position data
          const payload = {
            ...formData,
            sw_id: parentNode ? parentNode.data.sw_id : null,
            // Add the position to the payload
            position_x: position.x,
            position_y: position.y,
            position_mode: 1, // Mark as manually positioned
          };
          await createNode(payload);
        }

        // On success, trigger a full reload to show the changes
        forceRefetch();
      } catch (error) {
        console.error("Failed to save new node:", error);
        setLoading(false);
      }
    },
    [addModal, insertionEdge, nodes]
  );

  const handleConfirmDelete = useCallback(async () => {
    const { id, type } = deleteModal;

    try {
      if (type === "device") {
        // Find the node in the state to get its name from the 'data' object
        const nodeToDelete = nodes.find((n) => n.id === id);

        if (nodeToDelete) {
          // Construct the new payload with name and the currently selected OLT ID
          const nodeInfo = {
            name: nodeToDelete.data.name,
            sw_id: nodeToDelete.data.sw_id,
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
            name: targetNode.data.name,
            source_id: parseInt(edgeToDelete.source, 10),
            sw_id: targetNode.data.sw_id,
          };
          await deleteEdge(edgeInfo);
        }
      }

      // On success, reload the diagram to reflect the change
      forceRefetch();
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
      // Error toast is shown in graphUtils, so just stop the loading indicator
    } finally {
      setDeleteModal({ isOpen: false, id: null, type: "" });
      // setLoading will be turned off by the data reload effect
    }
  }, [deleteModal, edges, nodes]); // <-- Add 'nodes' to the dependency array
  const handleUpdateNodeLabel = useCallback(
    async (nodeId, updatedFormData) => {
      try {
        const nodeToUpdate = nodes.find((n) => n.id === nodeId);
        if (!nodeToUpdate) {
          throw new Error("Node to update not found.");
        }
        const payload = {
          ...updatedFormData,
          original_name: nodeToUpdate.data.name,
          sw_id: nodeToUpdate.data.sw_id,
        };
        await saveNodeInfo(payload); // Correctly passing nodeId here
        forceRefetch();
      } catch (error) {
        console.error("Error saving node info:", error);
      }
    },
    [nodes]
  );

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
    if (rootId === undefined) {
      setNodes([]);
      setEdges([]);
      return;
    }
    const loadInitialData = async () => {
      setLoading(true);
      setIsEmpty(false);
      try {
        const apiData = await fetchData(rootId);

        // --- THIS IS THE FIX ---
        const isGeneralView = rootId === null;

        // If we are on a specific /:id page, check if it's an OLT.
        if (!isGeneralView && apiData.length > 0) {
          const rootNodeFromData = apiData.find(
            (item) => String(item.id) === String(rootId)
          );

          if (rootNodeFromData && rootNodeFromData.node_type !== "OLT") {
            setRedirectInfo({
              shouldRedirect: true,
              message: "This view is only available for OLT devices.",
            });
            return;
          }
        }

        if (!apiData || apiData.length === 0) {
          setIsEmpty(true);
          setNodes([]);
          setEdges([]);
          setLoading(false);
          return;
        }

        // --- Data Processing and De-duplication (No changes here) ---
        // --- AND REPLACE IT WITH THIS NEW, ROBUST LOGIC ---
        const uniqueNodesMap = new Map();
        const nameSwIdToNodeIdMap = new Map();

        // This map will track devices by their logical identity (name + sw_id)
        const deviceIdentityMap = new Map();

        apiData.forEach((item) => {
          // A device's true identity is its name combined with its system ID (sw_id).
          // Use -1 for null sw_id to create a consistent key.
          const identityKey = `${item.name}-${item.sw_id ?? -1}`;

          // If we haven't seen this device before, add it.
          if (!deviceIdentityMap.has(identityKey)) {
            deviceIdentityMap.set(identityKey, item);
          } else {
            // If we have seen it, we might need to replace the existing one.
            const existingRecord = deviceIdentityMap.get(identityKey);
            // **This is the key**: a record with a parent is always preferred over an orphan.
            if (
              existingRecord.parent_id === null ||
              existingRecord.parent_id === 0
            ) {
              deviceIdentityMap.set(identityKey, item);
            }
          }
        });

        // Now, build the final uniqueNodesMap from the cleaned identity map.
        deviceIdentityMap.forEach((item, key) => {
          uniqueNodesMap.set(String(item.id), item);
          // Also populate the helper map for ONU lookups
          if (item.node_type === "ONU") {
            nameSwIdToNodeIdMap.set(key, String(item.id));
          }
        });
        const initialEdges = [];
        apiData.forEach((item) => {
          if (item.parent_id !== null && item.parent_id !== 0) {
            let targetId =
              item.node_type === "ONU" && item.name && item.sw_id
                ? nameSwIdToNodeIdMap.get(`${item.name}-${item.sw_id}`)
                : String(item.id);
            if (targetId) {
              initialEdges.push({
                id: `e-${item.id}`,
                source: String(item.parent_id),
                target: targetId,
                markerEnd: { type: MarkerType.ArrowClosed },
                style: { stroke: item.cable_color || "#1e293b" },
              });
            }
          }
        });
        const initialNodes = Array.from(uniqueNodesMap.values()).map((item) => {
          const nodeId =
            item.node_type === "ONU" && item.name && item.sw_id
              ? nameSwIdToNodeIdMap.get(`${item.name}-${item.sw_id}`)
              : String(item.id);

          // This logic checks if valid positions exist in the data
          const hasCustomPosition =
            item.position_x != null && item.position_y != null;

          return {
            id: nodeId,
            type: "custom",
            data: {
              ...item,
              label: item.name || `Node ${item.id}`,
              icon: getNodeIcon(item.node_type),
              // Store this flag so we know which nodes to auto-save
              hasCustomPosition: hasCustomPosition,
              onDetailsClick: handleDetailsClick,
              onNavigateClick: handleNavigateClick,
            },
            // Use saved positions if they exist, otherwise default to {0, 0}
            position: hasCustomPosition
              ? {
                  x: parseFloat(item.position_x),
                  y: parseFloat(item.position_y),
                }
              : { x: 0, y: 0 },
          };
        });

        // --- START: NEW AND FINAL LAYOUT LOGIC ---
        if (initialNodes.length > 0) {
          // --- THIS IS THE FIX ---
          // If we are in a specific OLT view, find that OLT node and force it
          // to be auto-positioned, ignoring any position it might have saved
          // from being moved in the general view.
          if (!isGeneralView) {
            initialNodes.forEach((node) => {
              if (String(node.data.id) === String(rootId)) {
                node.data.hasCustomPosition = false;
              }
            });
          }

          initialNodes.sort(compareNodesByLabel);
          const nodeMap = new Map(initialNodes.map((n) => [n.id, n]));
          let rootNode = null;
          if (!isGeneralView) {
            // In a specific /:id view, the root is always the OLT from the URL
            rootNode = initialNodes.find(
              (n) => String(n.data.id) === String(rootId)
            );
          } else if (dynamicRootId) {
            // In general view, if a root has been selected via the FAB, use it
            rootNode = initialNodes.find(
              (n) => String(n.id) === String(dynamicRootId)
            );
          }

          // 1. Build tree structure (CORRECTED)
          // First, initialize .children array on ALL nodes
          initialNodes.forEach((node) => {
            node.children = [];
          });
          // THEN, connect them
          // --- Replace it with this corrected version ---
          initialNodes.forEach((node) => {
            // Skip the root node itself as it has no parent in this context
            if (rootNode && node.id === rootNode.id) {
              return;
            }

            if (node.data.parent_id !== null && node.data.parent_id !== 0) {
              const parent = nodeMap.get(String(node.data.parent_id));
              if (parent) {
                parent.children.push(node);
              }
            }
          });

          // 2. Set X positions based on a more robust tree depth calculation
          initialNodes.forEach((node) => {
            node.level = -1; // Start with an invalid level
          });

          if (rootNode) {
            rootNode.level = 0;
            const queue = [rootNode];
            let head = 0;
            while (head < queue.length) {
              const parent = queue[head++];
              initialNodes.forEach((potentialChild) => {
                if (String(potentialChild.data.parent_id) === parent.id) {
                  if (potentialChild.level === -1) {
                    potentialChild.level = parent.level + 1;
                    queue.push(potentialChild);
                  }
                }
              });
            }
          }

          // --- REPLACE the code block above with this final version ---

          // Find how many orphans already have a manual position.
          const manuallyPositionedOrphanCount = initialNodes.filter(
            (n) => n.level === -1 && n.data.hasCustomPosition
          ).length;

          initialNodes.forEach((node) => {
            // If a node already has a position from the database, DO NOTHING.
            if (node.data.hasCustomPosition) {
              return;
            }

            // If it's part of the tree, calculate its X position.
            if (node.level !== -1) {
              node.position = { x: node.level * GRID_X_SPACING, y: 0 };
            } else {
              // If it's a true orphan (no saved position, no level), stack it.
              const autoOrphanIndex = initialNodes
                .filter((n) => n.level === -1 && !n.data.hasCustomPosition)
                .indexOf(node);

              // --- THIS IS THE FIX ---
              // Start the stack *after* the manually positioned orphans.
              node.position = {
                x: -GRID_X_SPACING,
                y:
                  (manuallyPositionedOrphanCount + autoOrphanIndex) *
                  GRID_Y_SPACING,
              };
            }
          });

          // 3. Perform Recursive Vertical Layout
          const gridNodeType = "ONU";

          const nodeHeight = 60;

          // Helper to get all grid children for a given parent ID
          const getGridChildren = (parentId) => {
            return initialNodes.filter(
              (n) =>
                String(n.data.parent_id) === parentId &&
                n.data.node_type === gridNodeType
            );
          };

          // Helper to get all non-grid (branching) children for a given parent ID
          const getBranchChildren = (parentId) => {
            return initialNodes
              .filter(
                (n) =>
                  String(n.data.parent_id) === parentId &&
                  n.data.node_type !== gridNodeType
              )
              .map((n) => nodeMap.get(n.id)) // Get the full node object
              .filter(Boolean);
          };

          function offsetBranch(node, offsetY) {
            if (!node || !node.position) return;

            // Only apply offset if the node doesn't have a custom position
            if (!node.data.hasCustomPosition) {
              node.position.y += offsetY;
            }

            // Recursively offset all of its descendants
            const allChildren = [
              ...getBranchChildren(node.id),
              ...getGridChildren(node.id),
            ];

            allChildren.forEach((childRef) => {
              const childNode = nodeMap.get(childRef.id);
              if (childNode) {
                offsetBranch(childNode, offsetY);
              }
            });
          }

          function layoutBranch(node) {
            if (!node) return 0;

            const branchChildren = getBranchChildren(node.id);
            const gridChildren = getGridChildren(node.id);

            // Sort children for consistent layout
            branchChildren.sort(compareNodesByLabel);
            gridChildren.sort(compareNodesByLabel);

            let currentY = 0;

            // 1. Layout all recursive branches first
            if (branchChildren.length > 0) {
              const branchHeights = branchChildren.map((child) =>
                layoutBranch(child)
              );

              branchChildren.forEach((child, index) => {
                const childHeight = branchHeights[index];
                offsetBranch(child, currentY);
                currentY += childHeight;
                if (index < branchChildren.length - 1) {
                  currentY += PADDING_BETWEEN_GRIDS;
                }
              });
            }

            // 2. Layout the grid of ONUs below the branches
            if (gridChildren.length > 0) {
              // Add padding if there were branches above
              if (branchChildren.length > 0) {
                currentY += PADDING_BETWEEN_GRIDS;
              }

              const startX = node.position.x + GRID_X_SPACING;
              gridChildren.forEach((childNode, index) => {
                const nodeToUpdate = nodeMap.get(childNode.id);
                if (nodeToUpdate && !nodeToUpdate.data.hasCustomPosition) {
                  const row = index % NODES_PER_COLUMN;
                  const column = Math.floor(index / NODES_PER_COLUMN);
                  // The key change: add the currentY offset to the grid position
                  nodeToUpdate.position.y = currentY + row * GRID_Y_SPACING;
                  nodeToUpdate.position.x = startX + column * GRID_X_SPACING;
                }
              });

              const numRows = Math.min(gridChildren.length, NODES_PER_COLUMN);
              const gridHeight =
                (numRows > 0 ? numRows - 1 : 0) * GRID_Y_SPACING + nodeHeight;
              currentY += gridHeight;
            }

            const totalHeight = Math.max(currentY, nodeHeight);

            // 3. Center the parent node relative to the total height of its children
            if (!node.data.hasCustomPosition) {
              // If it's a leaf node, its y is based on its own height
              if (totalHeight === nodeHeight) {
                node.position.y = 0;
              } else {
                node.position.y = (totalHeight - nodeHeight) / 2;
              }
            }

            return totalHeight;
          }

          if (rootNode) {
            layoutBranch(rootNode);
          }

          // >>> PASTE THE NEW AUTO-SAVE CODE HERE <<<
          const nodesToSave = initialNodes.filter((n) => {
            // Standard condition: Must not have a pre-existing custom position and must not be an orphan.
            const shouldSave = !n.data.hasCustomPosition && n.level !== -1;

            // --- THIS IS THE FIX ---
            // New condition: If we are in an OLT-specific view, do NOT save the root OLT node itself.
            const isRootNodeInOltView =
              !isGeneralView && String(n.data.id) === String(rootId);

            return shouldSave && !isRootNodeInOltView;
          });

          if (nodesToSave.length > 0) {
            console.log(
              `Auto-saving calculated positions for ${nodesToSave.length} nodes...`
            );

            const autoSavePromises = nodesToSave.map((node) => {
              const payload = {
                original_name: node.data.name,
                sw_id: node.data.sw_id,
                position_x: node.position.x,
                position_y: node.position.y,
                position_mode: 0, // Mark as auto-positioned
              };
              return saveNodeInfo(payload, true);
            });

            // Run the save operation in the background
            Promise.all(autoSavePromises)
              .then(() => console.log("Auto-save complete."))
              .catch((err) => console.error("Auto-save failed:", err));
          }
          // --- END of auto-save block ---

          setNodes(initialNodes);
          setEdges(initialEdges);
          initialNodesRef.current = initialNodes;

          setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.1, duration: 800 });
          }, 0);
        } else {
          setNodes([]);
          setEdges([]);
        }
        // --- END: NEW AND FINAL LAYOUT LOGIC ---
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [rootId, dynamicRootId, navigate]);

  useEffect(() => {
    const newRootId = id ? parseInt(id, 10) : null;
    setRootId(newRootId);

    // If we are navigating away from the general view, clear the dynamic root.
    if (newRootId !== null) {
      setDynamicRootId(null);
    } else {
      // When returning to the general view, re-load from localStorage.
      setDynamicRootId(localStorage.getItem("dynamicRootId"));
    }
  }, [id]);

  useEffect(() => {
    if (redirectInfo.shouldRedirect) {
      toast.error(redirectInfo.message);
      // Using { replace: true } is good practice here, as it replaces the
      // invalid URL in the history stack, so the user's back button works as expected.
      navigate("/", { replace: true });
      // Reset the state after navigating
      setRedirectInfo({ shouldRedirect: false, message: "" });
    }
  }, [redirectInfo, navigate]);

  useEffect(() => {
    if (rootId === null) {
      // Only save when in the general view
      if (dynamicRootId) {
        localStorage.setItem("dynamicRootId", dynamicRootId);
      } else {
        localStorage.removeItem("dynamicRootId"); // Clean up if no root is selected
      }
    }
  }, [dynamicRootId, rootId]);

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
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onEdgeUpdate={onEdgeUpdate}
        onEdgeUpdateStart={onEdgeUpdateStart}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
        onNodeClick={onNodeClick}
        onSelectionChange={onSelectionChange}
        selectionOnDrag={true}
        nodeTypes={nodeTypes}
      >
        <Background variant="dots" gap={12} size={1} />
        {contextMenu && (
          <ContextMenu {...contextMenu} onAction={handleAction} />
        )}
      </ReactFlow>

      {loading && <LoadingOverlay />}
      {!loading && isEmpty && <EmptyState />}

      {window.location.pathname !== "/" && (
        <div className="absolute top-4 left-4 z-10 text-gray-700">
          <button className="" title={"Go Back"} onClick={() => navigate("/")}>
            <FaChevronLeft />
          </button>
        </div>
      )}

      {!isEmpty && (
        <>
          <AddNodeFab onClick={handleAddNodeClick} />
          <EditFab isEditing={isEditMode} onClick={handleFabClick} />
          <SearchControl nodes={nodes} onNodeFound={onNodeFound} />
          <HelpBox />
          <ResetPositionsFab
            onReset={(scope) =>
              setResetConfirmModal({
                isOpen: true,
                scope,
                nodeId: null,
                nodeName: "",
              })
            }
            disabled={loading || isEditMode}
          />
          {rootId === null && (
            <SelectRootNodeFab onSelectRoot={handleSelectRoot} />
          )}
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
        parentNode={addModal.parentNode} // Pass the parent node to the modal
        defaultPosition={addModal.position}
        isInsertion={addModal.isInsertion}
      />
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, type: "" })}
        onConfirm={handleConfirmDelete}
        itemType={deleteModal.type}
      />
      <ConfirmResetModal
        isOpen={resetConfirmModal.isOpen}
        onClose={() =>
          setResetConfirmModal({
            isOpen: false,
            scope: null,
            nodeId: null,
            nodeName: "",
          })
        }
        onConfirm={handleConfirmReset}
        itemInfo={
          resetConfirmModal.nodeName
            ? `${resetConfirmModal.nodeName}` // For context menu reset
            : `all ${
                resetConfirmModal.scope === "manual"
                  ? "manually positioned"
                  : ""
              } devices` // For FAB reset
        }
      />
      <NodeDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, node: null })}
        node={detailModal.node}
      />
    </div>
  );
};

export default NetworkDiagram;
