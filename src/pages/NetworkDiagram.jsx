/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import {
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
import ResetViewFab from "../components/ui/ResetViewFab.jsx";
import UserStatus from "../components/ui/UserStatus";
import AddNodeFab from "../components/ui/AddNodeFab.jsx";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import SelectRootNodeFab from "../components/ui/SelectRootNodeFab.jsx";
import EditFab from "../components/ui/EditFab.jsx";
import CustomNode from "../components/CustomNode.jsx";
import GuidanceToast from "../components/ui/GuidanceToast";
import ContextMenu from "../components/ContextMenu.jsx";
import HelpBox from "../components/ui/HelpBox.jsx";
import SearchControl from "../components/ui/SearchControl.jsx";
import NodeDetailModal from "../components/modals/NodeDetailModal.jsx";
import AddNodeModal from "../components/modals/AddNodeModal.jsx";
import EditNodeModal from "../components/modals/EditNodeModal.jsx";
import ConfirmResetModal from "../components/modals/ConfirmResetModal.jsx";
import ConfirmDeleteModal from "../components/modals/ConfirmDeleteModal.jsx";
import LoadingOverlay from "../components/ui/LoadingOverlay.jsx";
import IconDock from "../components/ui/IconDock.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ResetPositionsFab from "../components/ui/ResetPositionsFab.jsx";
import UndoFab from "../components/ui/UndoFab.jsx";
import SelectRootNodeModal from "../components/modals/SelectRootNodeModal.jsx";
import { toast } from "react-toastify";

const nodeTypes = { custom: CustomNode };
const NODES_PER_COLUMN = 8;
const GRID_X_SPACING = 300;
const GRID_Y_SPACING = 80;
const PADDING_BETWEEN_GRIDS = 50;
const NODE_WIDTH = 250;
const NODE_HEIGHT = 60;

const NetworkDiagram = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef(null);
  const initialNodesRef = useRef([]);
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSelectRootModalOpen, setSelectRootModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [redirectInfo, setRedirectInfo] = useState({
    shouldRedirect: false,
    message: "",
  });
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [dynamicRootId, setDynamicRootId] = useState(() => {
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
    nodeName: "",
  });
  const [newConnections, setNewConnections] = useState([]);
  const [insertionEdge, setInsertionEdge] = useState(null);
  const edgeUpdateSuccessful = useRef(true);

  const getNodeIcon = (nodeType) => {
    switch (nodeType) {
      case "AP":
        return "ap";
      case "Bamboo":
        return "bamboo";
      case "mSwitch":
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
      case "uSwitch":
        return "uswitch";
      case "Other":
        return "other";
      default:
        return "other";
    }
  };

  const pushStateToHistory = useCallback(() => {
    const currentNodes = reactFlowInstance.getNodes();
    const currentEdges = reactFlowInstance.getEdges();
    setHistory((prev) => [
      ...prev,
      {
        nodes: currentNodes,
        edges: currentEdges,
        newConnections: newConnections,
      },
    ]);
  }, [reactFlowInstance, newConnections]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;

    setHistory((prevHistory) => {
      const newHistory = [...prevHistory];
      const lastState = newHistory.pop();

      if (lastState) {
        setNodes(lastState.nodes);
        setEdges(lastState.edges);
        setNewConnections(lastState.newConnections);
      }
      return newHistory;
    });
  }, [history, setNodes, setEdges, setNewConnections]);

  const handleDetailsClick = (nodeData) => {
    setDetailModal({ isOpen: true, node: { data: nodeData } });
  };

  const handleNavigateClick = (nodeId) => {
    navigate(`/${nodeId}`);
  };

  const handleAddNodeClick = () => {
    const viewportBounds = reactFlowWrapper.current.getBoundingClientRect();
    const targetPosition = {
      x: viewportBounds.width / 2,
      y: viewportBounds.height / 2,
    };

    const position = reactFlowInstance.screenToFlowPosition(targetPosition);

    const finalPosition = findAvailablePosition(position, nodes);

    setAddModal({
      isOpen: true,
      position: finalPosition,
      isInsertion: false,
      parentNode: null,
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
          return true;
        }
      }
      return false;
    };

    if (!isOccupied(desiredPosition)) {
      return desiredPosition;
    }

    const nudge = 100;
    for (let i = 1; i < 20; i++) {
      const candidates = [
        { x: desiredPosition.x + i * nudge, y: desiredPosition.y },
        { x: desiredPosition.x - i * nudge, y: desiredPosition.y },
        { x: desiredPosition.x, y: desiredPosition.y + i * nudge },
        { x: desiredPosition.x, y: desiredPosition.y - i * nudge },
      ];

      for (const candidate of candidates) {
        if (!isOccupied(candidate)) {
          return candidate;
        }
      }
    }

    return desiredPosition;
  };

  const handleResetPositions = useCallback(
    async (scope, nodeId = null) => {
      try {
        const payload = {
          sw_id: rootId ? parseInt(rootId, 10) : null,
          scope: nodeId ? null : scope,
          node_id: nodeId ? parseInt(nodeId, 10) : null,
        };
        await resetPositions(payload);

        window.location.reload();
      } catch (error) {
        console.error("Failed to reset positions:", error);
        setLoading(false);
      }
    },
    [rootId]
  );

  const handleConfirmReset = useCallback(async () => {
    const { scope, nodeId } = resetConfirmModal;
    await handleResetPositions(scope, nodeId);
    setResetConfirmModal({ isOpen: false, scope: null, nodeId: null });
  }, [resetConfirmModal, handleResetPositions]);

  const getSortableNumbers = (label = "") => {
    const matches = label.match(/\d+/g);
    return matches ? matches.map(Number) : [];
  };

  const onSelectionChange = useCallback(({ nodes }) => {
    setSelectedNodes(nodes.map((node) => node.id));
  }, []);

  const handleResetView = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.2, duration: 500 });
  }, [reactFlowInstance]);

  const compareNodesByLabel = (a, b) => {
    const numsA = getSortableNumbers(a.data.label);
    const numsB = getSortableNumbers(b.data.label);
    for (let i = 0; i < Math.min(numsA.length, numsB.length); i++) {
      if (numsA[i] !== numsB[i]) return numsA[i] - numsB[i];
    }
    return numsA.length - numsB.length;
  };

  const onNodeDragStart = useCallback(
    (event, node) => {
      if (isEditMode) {
        pushStateToHistory();
      }
    },
    [isEditMode, pushStateToHistory]
  );

  const onConnect = useCallback(
    (params) => {
      if (isEditMode) {
        pushStateToHistory();
      }
      const newEdge = {
        ...params,
        id: `e-${params.source}-${params.target}`,
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      setEdges((eds) => addEdge(newEdge, eds));

      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);
      if (isEditMode && sourceNode && targetNode) {
        setNewConnections((prevConnections) => [...prevConnections, params]);
      }
    },
    [nodes, setEdges, setNewConnections, isEditMode]
  );

  const handleFabClick = useCallback(async () => {
    if (isEditMode) {
      setLoading(true);

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

          setNewConnections([]);
          setTimeout(() => window.location.reload(), 300);
        } catch (error) {
          console.error("Failed to save changes:", error);
          setLoading(false);
        }
      } else {
        setLoading(false);
        setIsEditMode(false);
      }
    } else {
      setHistory([]);
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

  const onNodeContextMenu = (event, node) =>
    handleContextMenu(event, "node", node);

  const onEdgeContextMenu = (event, edge) =>
    handleContextMenu(event, "edge", edge);

  const onPaneClick = useCallback(() => setContextMenu(null), []);

  const onNodeClick = useCallback(
    (event, node) => {
      if (isEditMode) {
        return;
      }

      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, data: { ...n.data, isCollapsed: !n.data?.isCollapsed } }
            : n
        )
      );
    },
    [setNodes, isEditMode]
  );

  const handleAction = (action, { id }) => {
    setContextMenu(null);
    switch (action) {
      case "addNode": {
        const position = reactFlowInstance.screenToFlowPosition({
          x: contextMenu.left,
          y: contextMenu.top,
        });
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
          nodeName: nodeToReset ? nodeToReset.data.label : "",
        });
        break;
      }
    }
  };

  const handleAddNodeSave = useCallback(
    async (formData, position) => {
      try {
        const { parentNode, isInsertion } = addModal;
        if (addModal.isInsertion && insertionEdge) {
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
            original_edge_record_id: originalEdgeRecordId,
          };

          await insertNode(payload);
        } else {
          const payload = {
            ...formData,
            sw_id: parentNode ? parentNode.data.sw_id : null,
            position_x: position.x,
            position_y: position.y,
            position_mode: 1,
          };
          await createNode(payload);
        }
        sessionStorage.setItem("justAddedNode", "true");
        window.location.reload();
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
        const nodeToDelete = nodes.find((n) => n.id === id);

        if (nodeToDelete) {
          if (id === dynamicRootId) {
            localStorage.removeItem("dynamicRootId");
            setDynamicRootId(null);
          }
          const nodeInfo = {
            name: nodeToDelete.data.name,
            sw_id: nodeToDelete.data.sw_id,
          };
          await deleteNode(nodeInfo);
        } else {
          throw new Error("Node to delete was not found in the current state.");
        }
      } else {
        const edgeToDelete = edges.find((e) => e.id === id);
        const targetNode = nodes.find((n) => n.id === edgeToDelete.target);

        if (edgeToDelete && targetNode) {
          const edgeInfo = {
            name: targetNode.data.name,
            source_id: parseInt(edgeToDelete.source, 10),
            sw_id: targetNode.data.sw_id,
          };
          await deleteEdge(edgeInfo);
        }
      }

      window.location.reload();
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
    } finally {
      setDeleteModal({ isOpen: false, id: null, type: "" });
    }
  }, [deleteModal, edges, nodes]);

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
        await saveNodeInfo(payload);
        setTimeout(() => window.location.reload(), 300);
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
      visibleEdges: edges
        .filter(
          (e) =>
            !hidden.edgeIds.has(e.id) &&
            !hidden.nodeIds.has(e.source) &&
            !hidden.nodeIds.has(e.target)
        )
        .map((edge) => ({
          ...edge,
          interactive: isEditMode,
        })),
    };
  }, [nodes, edges, isEditMode]);

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

        const isGeneralView = rootId === null;

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

        const uniqueNodesMap = new Map();
        const nameSwIdToNodeIdMap = new Map();

        const deviceIdentityMap = new Map();

        apiData.forEach((item) => {
          const identityKey = `${item.name}-${item.sw_id ?? -1}`;

          if (!deviceIdentityMap.has(identityKey)) {
            deviceIdentityMap.set(identityKey, item);
          } else {
            const existingRecord = deviceIdentityMap.get(identityKey);
            if (
              existingRecord.parent_id === null ||
              existingRecord.parent_id === 0
            ) {
              deviceIdentityMap.set(identityKey, item);
            }
          }
        });
        
        deviceIdentityMap.forEach((item, key) => {
          uniqueNodesMap.set(String(item.id), item);
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

          const hasCustomPosition =
            item.position_x != null && item.position_y != null;

          return {
            id: nodeId,
            type: "custom",
            data: {
              ...item,
              label: item.name || `Node ${item.id}`,
              icon: getNodeIcon(item.node_type),
              hasCustomPosition: hasCustomPosition,
              onDetailsClick: handleDetailsClick,
              onNavigateClick: handleNavigateClick,
            },
            position: hasCustomPosition
              ? {
                  x: parseFloat(item.position_x),
                  y: parseFloat(item.position_y),
                }
              : { x: 0, y: 0 },
          };
        });

        if (initialNodes.length > 0) {
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
            rootNode = initialNodes.find(
              (n) => String(n.data.id) === String(rootId)
            );
          } else if (dynamicRootId) {
            rootNode = initialNodes.find(
              (n) => String(n.id) === String(dynamicRootId)
            );
          }

          initialNodes.forEach((node) => {
            node.children = [];
          });
          initialNodes.forEach((node) => {
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

          initialNodes.forEach((node) => {
            node.level = -1;
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

          const manuallyPositionedOrphanCount = initialNodes.filter(
            (n) => n.level === -1 && n.data.hasCustomPosition
          ).length;

          initialNodes.forEach((node) => {
            if (node.data.hasCustomPosition) {
              return;
            }

            if (node.level !== -1) {
              node.position = { x: node.level * GRID_X_SPACING, y: 0 };
            } else {
              const autoOrphanIndex = initialNodes
                .filter((n) => n.level === -1 && !n.data.hasCustomPosition)
                .indexOf(node);

              node.position = {
                x: -GRID_X_SPACING,
                y:
                  (manuallyPositionedOrphanCount + autoOrphanIndex) *
                  GRID_Y_SPACING,
              };
            }
          });

          const gridNodeType = "ONU";
          const nodeHeight = 60;

          const getGridChildren = (parentId) => {
            return initialNodes.filter(
              (n) =>
                String(n.data.parent_id) === parentId &&
                n.data.node_type === gridNodeType
            );
          };

          const getBranchChildren = (parentId) => {
            return initialNodes
              .filter(
                (n) =>
                  String(n.data.parent_id) === parentId &&
                  n.data.node_type !== gridNodeType
              )
              .map((n) => nodeMap.get(n.id))
              .filter(Boolean);
          };

          function offsetBranch(node, offsetY) {
            if (!node || !node.position) return;

            if (!node.data.hasCustomPosition) {
              node.position.y += offsetY;
            }

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

            branchChildren.sort(compareNodesByLabel);
            gridChildren.sort(compareNodesByLabel);

            let currentY = 0;

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

            if (gridChildren.length > 0) {
              if (branchChildren.length > 0) {
                currentY += PADDING_BETWEEN_GRIDS;
              }

              const startX = node.position.x + GRID_X_SPACING;
              gridChildren.forEach((childNode, index) => {
                const nodeToUpdate = nodeMap.get(childNode.id);
                if (nodeToUpdate && !nodeToUpdate.data.hasCustomPosition) {
                  const row = index % NODES_PER_COLUMN;
                  const column = Math.floor(index / NODES_PER_COLUMN);
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

            if (!node.data.hasCustomPosition) {
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

          const nodesToSave = initialNodes.filter((n) => {
            const shouldSave = !n.data.hasCustomPosition && n.level !== -1;

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
                position_mode: 0,
              };
              return saveNodeInfo(payload, true);
            });

            Promise.all(autoSavePromises)
              .then(() => console.log("Auto-save complete."))
              .catch((err) => console.error("Auto-save failed:", err));
          }

          setNodes(initialNodes);
          setEdges(initialEdges);
          initialNodesRef.current = initialNodes;

          setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.3, duration: 500 });
          }, 300);
        } else {
          setNodes([]);
          setEdges([]);
        }
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

    if (newRootId !== null) {
      setDynamicRootId(null);
    } else {
      setDynamicRootId(localStorage.getItem("dynamicRootId"));
    }
  }, [id]);

  useEffect(() => {
    if (redirectInfo.shouldRedirect) {
      toast.error(redirectInfo.message);
      navigate("/", { replace: true });
      setRedirectInfo({ shouldRedirect: false, message: "" });
    }
  }, [redirectInfo, navigate]);

  useEffect(() => {
    if (rootId === null) {
      if (dynamicRootId) {
        localStorage.setItem("dynamicRootId", dynamicRootId);
      } else {
        localStorage.removeItem("dynamicRootId");
      }
    }
  }, [dynamicRootId, rootId]);

  useEffect(() => {
    if (loading || isEmpty) {
      return;
    }

    const toastId = "guidance-toast";
    const justAdded = sessionStorage.getItem("justAddedNode");

    const isRootSelectedAndValid =
      dynamicRootId && nodes.some((n) => n.id === dynamicRootId);

    if (isRootSelectedAndValid) {
      toast.dismiss(toastId);
      return;
    }

    const hasRootCandidate = nodes.some((node) =>
      ["Router", "Managed Switch", "Unmanaged Switch"].includes(
        node.data.node_type
      )
    );

    if (justAdded) {
      sessionStorage.removeItem("justAddedNode");
      if (hasRootCandidate) {
        toast(
          <GuidanceToast
            title="Next Step: Set Your Root Node"
            message="Great! Now click the <strong>sitemap icon</strong> (bottom center) to select your new Router/Switch as the root of the network."
          />,
          { toastId, autoClose: false, closeOnClick: true, type: "info" }
        );
      } else {
        toast(
          <GuidanceToast
            title="Next Step: Add a Core Device"
            message="To build your network, you need a starting point. Please add a <strong>Router</strong> or a <strong>Switch</strong> to serve as your root device."
          />,
          { toastId, autoClose: false, closeOnClick: true, type: "info" }
        );
      }
    } else if (rootId === null && hasRootCandidate && !isRootSelectedAndValid) {
      toast(
        <GuidanceToast
          title="Select a Root Node"
          message="Welcome! To get started, please select a root device for your network view using the <strong>sitemap icon</strong>."
        />,
        { toastId, autoClose: false, closeOnClick: true, type: "info" }
      );
    }
  }, [nodes, loading, isEmpty, dynamicRootId, rootId]);

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
        edgesUpdatable={false}
        onNodeDragStart={onNodeDragStart}
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
      <UserStatus />

      {loading && <LoadingOverlay />}
      {!loading && isEmpty && (
        <>
          <EmptyState />
          <HelpBox isEmpty={isEmpty} />
          <IconDock>
            <AddNodeFab onClick={handleAddNodeClick} />
          </IconDock>
        </>
      )}

      {window.location.pathname !== "/" && (
        <div className="absolute top-4 left-4 z-10 text-gray-700">
          <button
            className=""
            title={"Go Back"}
            onClick={() => window.location.replace("/")}
          >
            <FaChevronLeft />
          </button>
        </div>
      )}

      {!isEmpty && (
        <>
          <SearchControl nodes={nodes} onNodeFound={onNodeFound} />

          <HelpBox isEmpty={isEmpty} />
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
          <IconDock>
            {rootId === null && (
              <SelectRootNodeFab onClick={() => setSelectRootModalOpen(true)} />
            )}
            <AddNodeFab onClick={handleAddNodeClick} />
            <EditFab isEditing={isEditMode} onClick={handleFabClick} />
            <UndoFab onClick={handleUndo} disabled={history.length === 0} />
            <ResetViewFab onClick={handleResetView} />
          </IconDock>
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
        parentNode={addModal.parentNode}
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
            ? `${resetConfirmModal.nodeName}`
            : `all ${
                resetConfirmModal.scope === "manual"
                  ? "manually positioned"
                  : ""
              } devices`
        }
      />
      <NodeDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, node: null })}
        node={detailModal.node}
      />
      <SelectRootNodeModal
        isOpen={isSelectRootModalOpen}
        onClose={() => setSelectRootModalOpen(false)}
        onSelect={handleSelectRoot}
      />
    </div>
  );
};

export default NetworkDiagram;
