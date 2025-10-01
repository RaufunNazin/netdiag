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
  createNode,
  insertNode,
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
        await saveNodeInfo(nodeId, payload); // Correctly passing nodeId here
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
                style: { stroke: item.cable_color || "#b1b1b7" },
              });
            }
          }
        });
        const initialNodes = Array.from(uniqueNodesMap.values()).map((item) => {
          const nodeId =
            item.node_type === "ONU" && item.name && item.sw_id
              ? nameSwIdToNodeIdMap.get(`${item.name}-${item.sw_id}`)
              : String(item.id);
          return {
            id: nodeId,
            type: "custom",
            data: {
              ...item,
              label: item.name || `Node ${item.id}`,
              icon: getNodeIcon(item.node_type),
            },
            position: { x: 0, y: 0 },
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
              console.warn(
                "Node was not reached in layout, placing at origin:",
                node
              );
              node.level = 0; // Fallback for orphaned nodes
            }
            node.position = { x: node.level * GRID_X_SPACING, y: 0 };
          });

          // 3. Perform Recursive Vertical Layout
          const gridNodeType = "ONU";
          const gridNodesByParent = initialNodes
            .filter((n) => n.data.node_type === gridNodeType)
            .reduce((acc, node) => {
              const parentId = String(node.data.parent_id);
              if (!acc[parentId]) acc[parentId] = [];
              acc[parentId].push(node);
              return acc;
            }, {});

          const nodeHeight = 60;

          function offsetBranch(node, offsetY) {
            if (!node || !node.position) return;
            node.position.y += offsetY;
            if (node.children) {
              node.children.forEach((childRef) => {
                const childNode = nodeMap.get(childRef.id);
                offsetBranch(childNode, offsetY);
              });
            }
          }

          function layoutBranch(node) {
            const childrenToGrid = gridNodesByParent[node.id];
            if (childrenToGrid && childrenToGrid.length > 0) {
              const sortedChildren = [...childrenToGrid].sort(
                compareNodesByLabel
              );
              const startX = node.position.x + GRID_X_SPACING;
              sortedChildren.forEach((childNode, index) => {
                const row = index % NODES_PER_COLUMN;
                const column = Math.floor(index / NODES_PER_COLUMN);
                const nodeToUpdate = nodeMap.get(childNode.id);
                if (nodeToUpdate) {
                  nodeToUpdate.position.y = row * GRID_Y_SPACING;
                  nodeToUpdate.position.x = startX + column * GRID_X_SPACING;
                }
              });
              const numRows = Math.min(sortedChildren.length, NODES_PER_COLUMN);
              const gridHeight =
                (numRows > 0 ? numRows - 1 : 0) * GRID_Y_SPACING + nodeHeight;
              node.position.y = (gridHeight - nodeHeight) / 2;
              return gridHeight;
            }

            if (!node.children || node.children.length === 0) {
              node.position.y = 0;
              return nodeHeight;
            }

            let currentY = 0;
            const children = node.children
              .map((c) => nodeMap.get(c.id))
              .filter(Boolean);
            children.sort(compareNodesByLabel);
            children.forEach((child, index) => {
              const childHeight = layoutBranch(child);
              offsetBranch(child, currentY);
              if (index < children.length - 1) {
                currentY += childHeight + PADDING_BETWEEN_GRIDS;
              } else {
                currentY += childHeight;
              }
            });
            const totalHeight = currentY;
            node.position.y = (totalHeight - nodeHeight) / 2;
            return totalHeight;
          }

          if (rootNode) {
            layoutBranch(rootNode);
          }

          setNodes(initialNodes);
          setEdges(initialEdges);
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
