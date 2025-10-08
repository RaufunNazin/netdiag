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

import {
  fetchOlts,
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
import ResetPositionsFab from "../components/ui/ResetPositionsFab.jsx";

import { toast } from "react-toastify";

const nodeTypes = { custom: CustomNode };
const NODES_PER_COLUMN = 8; // Renamed from NODES_PER_ROW
const GRID_X_SPACING = 300;
const GRID_Y_SPACING = 80;
const PADDING_BETWEEN_GRIDS = 50;

const NetworkDiagram = () => {
  // All of your state and logic from the original component goes here...
  // (useState, useCallback, useEffect, etc.)
  const reactFlowWrapper = useRef(null);
  const initialNodesRef = useRef([]);
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState([]); // <-- 1. ADD THIS STATE
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

  // Add this helper function inside your NetworkDiagram component, before the return statement
  const getNodeIcon = (nodeType) => {
    switch (nodeType) {
      case "OLT":
        return "olt";
      case "PON":
        return "pon";
      case "SPLITTER":
        return "splitter";
      case "TJ":
        return "tj";
      case "uSWITCH":
        return "uswitch";
      case "mSWITCH":
        return "mswitch";
      case "ONU":
        return "onu";
      default:
        return "default";
    }
  };

  // Add this new handler function
  const handleResetPositions = useCallback(
    async (scope, nodeId = null) => {
      if (!selectedOlt) {
        toast.warn("Please select an OLT first.");
        return;
      }
      setLoading(true);
      try {
        const payload = {
          sw_id: parseInt(selectedOlt, 10),
          // If a nodeId is provided, scope is irrelevant for the API
          // but we still structure the payload cleanly.
          scope: nodeId ? null : scope,
          node_id: nodeId ? parseInt(nodeId, 10) : null,
        };
        await resetPositions(payload);

        // Reload the diagram to show the re-calculated layout
        const currentOlt = selectedOlt;
        setSelectedOlt(null); // Trigger the useEffect
        setTimeout(() => setSelectedOlt(currentOlt), 50);
      } catch (error) {
        console.error("Failed to reset positions:", error);
        // Toast is handled in graphUtils, so just stop loading indicator
        setLoading(false);
      }
    },
    [selectedOlt]
  );

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

  const handleFabClick = useCallback(async () => {
    if (isEditMode) {
      setLoading(true);

      // Get the original nodes from the ref and the current nodes from the instance
      const originalNodes = initialNodesRef.current;
      const currentNodes = reactFlowInstance.getNodes();

      // For faster lookups, create a map of original positions
      const originalNodeMap = new Map(
        originalNodes.map((node) => [node.id, node])
      );

      // --- 1. Identify which nodes have actually moved ---
      const movedNodes = currentNodes.filter((currentNode) => {
        const originalNode = originalNodeMap.get(currentNode.id);
        // A node is considered moved if its original state exists and
        // its x or y position has changed.
        return (
          originalNode &&
          (currentNode.position.x !== originalNode.position.x ||
            currentNode.position.y !== originalNode.position.y)
        );
      });

      // Proceed only if there are changes to save
      if (movedNodes.length > 0 || newConnections.length > 0) {
        try {
          // --- 2. Create promises for saving new connections (this is unchanged) ---
          const connectionPromises = newConnections.map((conn) => {
            const newParentId = parseInt(conn.source, 10);
            const sourceNodeId = parseInt(conn.target, 10);
            return copyNodeInfo(sourceNodeId, newParentId);
          });

          // --- 3. Create promises for saving moved nodes' positions ---
          const positionSavePromises = movedNodes.map((node) => {
            const payload = {
              original_name: node.data.name,
              sw_id: node.data.sw_id,
              position_x: node.position.x,
              position_y: node.position.y,
              position_mode: 1, // Mark as manually positioned
            };
            return saveNodeInfo(payload, true);
          });

          // --- 4. Run all save operations in parallel ---
          await Promise.all([...connectionPromises, ...positionSavePromises]);

          // --- 5. Clear pending changes on success and reload the diagram ---
          setNewConnections([]);
          const currentOlt = selectedOlt;
          setSelectedOlt(null);
          setTimeout(() => setSelectedOlt(currentOlt), 50);
        } catch (error) {
          console.error("Failed to save changes:", error);
          setLoading(false);
          return; // Stop and stay in edit mode on error
        }
      }
    }
    // Toggle edit mode
    setIsEditMode((prevMode) => !prevMode);
  }, [isEditMode, newConnections, selectedOlt, reactFlowInstance]);

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
        const parentNode = nodes.find((n) => n.id === id);
        setAddModal({ isOpen: true, position, isInsertion: false, parentNode });
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
      case "resetPosition": // <-- ADD THIS CASE
        handleResetPositions(null, id); // scope is null, pass the node id
        break;
    }
  };

  const handleAddNodeSave = useCallback(
    async (formData) => {
      setLoading(true);
      try {
        // Check if this is an INSERT operation
        if (addModal.isInsertion && insertionEdge) {
          // --- INSERTION LOGIC ---

          // The edge ID from React Flow is 'e-DATABASE_ID'. We need the number part.
          const originalEdgeRecordId = parseInt(
            insertionEdge.id.replace("e-", ""),
            10
          );

          const payload = {
            new_node_data: {
              ...formData,
              cable_color: insertionEdge.style?.stroke || null,
              sw_id: parseInt(selectedOlt, 10),
            },
            original_source_id: parseInt(insertionEdge.source, 10),
            original_edge_record_id: originalEdgeRecordId, // Send the record ID
          };

          await insertNode(payload);
        } else {
          // This is a regular ADD operation
          const payload = {
            ...formData,
            sw_id: parseInt(selectedOlt, 10),
          };
          await createNode(payload);
        }

        // On success, trigger a full reload to show the changes
        const currentOlt = selectedOlt;
        setSelectedOlt(null);
        setTimeout(() => setSelectedOlt(currentOlt), 50);
      } catch (error) {
        console.error("Failed to save new node:", error);
        setLoading(false); // Stop loading on error
      }
    },
    [selectedOlt, addModal.isInsertion, insertionEdge] // Add dependencies
  );

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
        const nodeToUpdate = nodes.find((n) => n.id === nodeId);
        if (!nodeToUpdate) {
          throw new Error("Node to update not found.");
        }
        const payload = {
          ...updatedFormData,
          original_name: nodeToUpdate.data.name,
          sw_id: parseInt(selectedOlt, 10),
        };
        await saveNodeInfo(payload); // Correctly passing nodeId here
        const currentOlt = selectedOlt;
        setSelectedOlt(null);
        setTimeout(() => setSelectedOlt(currentOlt), 50);
      } catch (error) {
        console.error("Error saving node info:", error);
      }
    },
    [nodes, selectedOlt]
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
      return;
    }
    localStorage.setItem("selectedOlt", selectedOlt);
    const loadInitialData = async () => {
      setLoading(true);
      setIsEmpty(false);
      try {
        const apiData = await fetchData(selectedOlt);
        if (!apiData || apiData.length === 0) {
          setIsEmpty(true);
          setNodes([]);
          setEdges([]);
          setLoading(false);
          return;
        }

        // --- Data Processing and De-duplication (No changes here) ---
        const uniqueNodesMap = new Map();
        const nameSwIdToNodeIdMap = new Map();
        apiData.forEach((item) => {
          if (item.node_type !== "ONU")
            uniqueNodesMap.set(String(item.id), item);
        });
        const onuRecordsByNameSwId = {};
        apiData.forEach((item) => {
          if (item.node_type === "ONU" && item.name && item.sw_id) {
            const key = `${item.name}-${item.sw_id}`;
            if (!onuRecordsByNameSwId[key]) onuRecordsByNameSwId[key] = [];
            onuRecordsByNameSwId[key].push(item);
          }
        });
        for (const key in onuRecordsByNameSwId) {
          const records = onuRecordsByNameSwId[key];
          let primaryRecord = records[0];
          for (const record of records) {
            const parentNode = uniqueNodesMap.get(String(record.parent_id));
            if (parentNode && record.name.startsWith(parentNode.name)) {
              primaryRecord = record;
              break;
            }
          }
          uniqueNodesMap.set(String(primaryRecord.id), primaryRecord);
          nameSwIdToNodeIdMap.set(key, String(primaryRecord.id));
        }
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
                style: { stroke: item.cable_color || "#b1b1b1" },
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
          const nodeMap = new Map(initialNodes.map((n) => [n.id, n]));
          let rootNode = null;

          // 1. Build tree structure (CORRECTED)
          // First, initialize .children array on ALL nodes
          initialNodes.forEach((node) => {
            node.children = [];
          });
          // THEN, connect them
          initialNodes.forEach((node) => {
            if (node.data.node_type === "OLT") {
              rootNode = node;
            } else if (node.data.parent_id) {
              const parent = nodeMap.get(String(node.data.parent_id));
              if (parent) {
                // This is now safe, because parent.children is guaranteed to exist.
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

          initialNodes.forEach((node) => {
            if (node.level === -1) {
              console.warn("Orphaned node detected:", node);
              // --- NEW: Position orphans at the bottom ---
              // Give them a high `y` value to place them below the main tree.
              // We'll assign a unique x position to prevent stacking.
              const orphanIndex = initialNodes
                .filter((n) => n.level === -1)
                .indexOf(node);
              node.position = { x: -200, y: 2500 + orphanIndex * 80 };
              // Mark it as custom so the layout algorithm ignores it
              node.data.hasCustomPosition = true;
            } else if (!node.data.hasCustomPosition) {
              // This is the corrected logic for regular nodes.
              // It only sets the initial x/y for nodes that need to be auto-laid-out.
              node.position = { x: node.level * GRID_X_SPACING, y: 0 };
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
          const nodesToSave = initialNodes.filter(
            (n) => !n.data.hasCustomPosition
          );

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
  }, [selectedOlt]);

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
        onSelectionChange={onSelectionChange} // <-- 3. ADD THIS PROP
        selectionOnDrag={true} // <-- 4. ADD THIS PROP
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
          <ResetPositionsFab
            onReset={handleResetPositions}
            disabled={loading || isEditMode}
          />
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
    </div>
  );
};

export default NetworkDiagram;
