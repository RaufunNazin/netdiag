/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  Suspense,
  lazy,
} from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  reconnectEdge,
  useReactFlow,
  Background,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { UI_ICONS } from "../utils/icons";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
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
import { ACTIONS, NODE_TYPES_ENUM, MISC } from "../utils/enums";
import CustomNode from "../components/CustomNode.jsx";
import ContextMenu from "../components/ContextMenu.jsx";
import UserStatus from "../components/ui/UserStatus";
import ResetViewFab from "../components/ui/ResetViewFab.jsx";
import AddNodeFab from "../components/ui/AddNodeFab.jsx";
import EditFab from "../components/ui/EditFab.jsx";
import SelectRootNodeFab from "../components/ui/SelectRootNodeFab.jsx";
import ResetPositionsFab from "../components/ui/ResetPositionsFab.jsx";
import UndoFab from "../components/ui/UndoFab.jsx";
import SearchControl from "../components/ui/SearchControl.jsx";
import IconDock from "../components/ui/IconDock.jsx";
import HelpBox from "../components/ui/HelpBox.jsx";
import GuidanceToast from "../components/ui/GuidanceToast";
import EmptyState from "../components/ui/EmptyState.jsx";
import LoadingOverlay from "../components/ui/LoadingOverlay.jsx";
const NodeDetailModal = lazy(() =>
  import("../components/modals/NodeDetailModal.jsx")
);
const AddNodeModal = lazy(() =>
  import("../components/modals/AddNodeModal.jsx")
);
const EditNodeModal = lazy(() =>
  import("../components/modals/EditNodeModal.jsx")
);
const ConfirmResetModal = lazy(() =>
  import("../components/modals/ConfirmResetModal.jsx")
);
const ConfirmDeleteModal = lazy(() =>
  import("../components/modals/ConfirmDeleteModal.jsx")
);
const SelectRootNodeModal = lazy(() =>
  import("../components/modals/SelectRootNodeModal.jsx")
);
const ConfirmSaveModal = lazy(() =>
  import("../components/modals/ConfirmSaveModal.jsx")
);
const OrphanDrawer = lazy(() => import("../components/ui/OrphanDrawer.jsx"));

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
  const reactFlowInstance = useReactFlow();
  const initialNodesRef = useRef([]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [orphanNodes, setOrphanNodes] = useState([]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSelectRootModalOpen, setSelectRootModalOpen] = useState(false);
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

  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [rootId, setRootId] = useState(undefined);
  const [dynamicRootId, setDynamicRootId] = useState(() =>
    id ? null : localStorage.getItem("dynamicRootId")
  );
  const [diagramRoots, setDiagramRoots] = useState({ main: null, sub: [] });

  const [selectedNodes, setSelectedNodes] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [history, setHistory] = useState([]);
  const [newConnections, setNewConnections] = useState([]);
  const [updatedConnections, setUpdatedConnections] = useState([]);
  const [deletedNodes, setDeletedNodes] = useState([]);
  const [deletedEdges, setDeletedEdges] = useState([]);
  const [insertionEdge, setInsertionEdge] = useState(null);
  const [isSaveConfirmModalOpen, setIsSaveConfirmModalOpen] = useState(false);

  const [redirectInfo, setRedirectInfo] = useState({
    shouldRedirect: false,
    message: "",
  });

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
        updatedConnections: updatedConnections,
        deletedNodes: deletedNodes,
        deletedEdges: deletedEdges,
      },
    ]);
  }, [
    reactFlowInstance,
    newConnections,
    updatedConnections,
    deletedNodes,
    deletedEdges,
  ]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;

    setHistory((prevHistory) => {
      const newHistory = [...prevHistory];
      const lastState = newHistory.pop();

      if (lastState) {
        setNodes(lastState.nodes);
        setEdges(lastState.edges);
        setNewConnections(lastState.newConnections);
        setUpdatedConnections(lastState.updatedConnections);
        setDeletedNodes(lastState.deletedNodes);
        setDeletedEdges(lastState.deletedEdges);
      }
      return newHistory;
    });
  }, [history, setNodes, setEdges, setNewConnections]);

  const handleDetailsClick = useCallback((nodeData) => {
    setDetailModal({ isOpen: true, node: { data: nodeData } });
  }, []);

  const handleNavigateClick = useCallback(
    (nodeId) => {
      navigate(`/${nodeId}`);
    },
    [navigate]
  );

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

  const handleConfirmSave = useCallback(async () => {
    setIsSaveConfirmModalOpen(false);
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

    try {
      const connectionPromises = newConnections.map((conn) => {
        const newParentId = parseInt(conn.source, 10);
        const sourceNodeId = parseInt(conn.target, 10);
        return copyNodeInfo(sourceNodeId, newParentId, true);
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

      const deleteNodePromises = deletedNodes.map((nodeInfo) =>
        deleteNode(nodeInfo, true)
      );

      const deleteEdgePromises = deletedEdges.map((edgeInfo) =>
        deleteEdge(edgeInfo, true)
      );

      const updatePromises = updatedConnections.map(async (conn) => {
        const edgeInfo = {
          name: conn.childNodeInfo.name,
          source_id: parseInt(conn.oldParentId, 10),
          sw_id: conn.childNodeInfo.sw_id,
        };
        await deleteEdge(edgeInfo, true);
        return copyNodeInfo(
          parseInt(conn.childId, 10),
          parseInt(conn.newParentId, 10),
          true
        );
      });

      await Promise.all([
        ...connectionPromises,
        ...positionSavePromises,
        ...updatePromises,
        ...deleteNodePromises,
        ...deleteEdgePromises,
      ]);

      toast.success("All changes saved successfully!");

      window.location.reload();

      setNewConnections([]);
      setUpdatedConnections([]);
      setDeletedNodes([]);
      setDeletedEdges([]);

      setHistory([]);

      initialNodesRef.current = reactFlowInstance.getNodes();

      setIsEditMode(false);
    } catch (error) {
      console.error("Failed to save changes:", error);
      toast.error(
        error.response?.data?.detail ||
          "Failed to save all changes. Please try again."
      );
      setLoading(false);
    }
  }, [
    reactFlowInstance,
    newConnections,
    updatedConnections,
    deletedNodes,
    deletedEdges,
    setNewConnections,
    setUpdatedConnections,
    setDeletedNodes,
    setDeletedEdges,
    setHistory,
    setIsEditMode,
    setLoading,
    setIsSaveConfirmModalOpen,
  ]);

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
    [nodes, setEdges, setNewConnections, isEditMode, pushStateToHistory]
  );

  const handleFabClick = useCallback(async () => {
    if (isEditMode) {
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

      const hasChanges =
        movedNodes.length > 0 ||
        newConnections.length > 0 ||
        updatedConnections.length > 0 ||
        deletedNodes.length > 0 ||
        deletedEdges.length > 0;

      if (hasChanges) {
        setIsSaveConfirmModalOpen(true);
      } else {
        toast.info("No changes to save.");
        setIsEditMode(false);
      }
    } else {
      setHistory([]);
      setDeletedNodes([]);
      setDeletedEdges([]);
      setIsEditMode(true);
    }
  }, [
    isEditMode,
    newConnections,
    updatedConnections,
    deletedNodes,
    deletedEdges,
    reactFlowInstance,
    setIsEditMode,
    setHistory,
    setDeletedNodes,
    setDeletedEdges,
    setIsSaveConfirmModalOpen,
  ]);

  const onEdgeUpdate = useCallback(
    (oldEdge, newConnection) => {
      if (!isEditMode) return;

      pushStateToHistory();

      const childNode = nodes.find((n) => n.id === newConnection.target);

      if (childNode) {
        setUpdatedConnections((prev) => [
          ...prev,
          {
            oldParentId: oldEdge.source,
            newParentId: newConnection.source,
            childId: newConnection.target,
            childNodeInfo: childNode.data,
          },
        ]);
      }

      setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    },
    [setEdges, isEditMode, pushStateToHistory, nodes]
  );

  const isValidConnection = useCallback((connection) => {
    if (connection.source === connection.target) return false;
    return (
      connection.sourceHandle === MISC.RIGHT &&
      connection.targetHandle === MISC.LEFT
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

  const onNodeContextMenu = (event, node) => {
    event.preventDefault();
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    setContextMenu({
      id: node.id,
      type: "node",
      top: event.clientY - reactFlowBounds.top,
      left: event.clientX - reactFlowBounds.left,
      node: node,
    });
  };

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

  const handleAction = (action, { id, node }) => {
    setContextMenu(null);
    switch (action) {
      case ACTIONS.ADD_NODE: {
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
      case ACTIONS.SEND_TO_INVENTORY: {
        const nodeToSend = nodes.find((n) => n.id === id);
        if (nodeToSend) {
          setOrphanNodes((prev) => [...prev, nodeToSend]);
          setNodes((nds) => nds.filter((n) => n.id !== id));
          setEdges((eds) =>
            eds.filter((e) => e.source !== id && e.target !== id)
          );

          saveNodeInfo(
            {
              original_name: nodeToSend.data.name,
              sw_id: nodeToSend.data.sw_id,
              position_x: null,
              position_y: null,
              position_mode: 0,
            },
            true
          );
          toast.info(`${nodeToSend.data.label} sent to inventory.`);
        }
        break;
      }
      case ACTIONS.EDIT_NODE: {
        const nodeToEdit = nodes.find((n) => n.id === id);
        if (nodeToEdit) setEditModal({ isOpen: true, node: nodeToEdit });
        break;
      }
      case ACTIONS.DELETE_NODE:
        if (isEditMode) {
          handleOptimisticDelete(id, MISC.DEVICE);
        } else {
          setDeleteModal({ isOpen: true, id, type: MISC.DEVICE });
        }
        break;
      case ACTIONS.DELETE_EDGE:
        if (isEditMode) {
          handleOptimisticDelete(id, "connection");
        } else {
          setDeleteModal({ isOpen: true, id, type: "connection" });
        }
        break;
      case ACTIONS.INSERT_NODE: {
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
      case ACTIONS.RESET_POSITION: {
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
            sw_id: parentNode ? parentNode.data.sw_id : rootId,
            position_x: null,
            position_y: null,
            position_mode: 0,
          };

          const newNodeData = await createNode(payload);

          if (newNodeData) {
            const newNode = {
              id: String(newNodeData.id),
              type: "custom",
              data: {
                ...newNodeData,
                label: newNodeData.name || `Node ${newNodeData.id}`,
                icon: getNodeIcon(newNodeData.node_type),
                hasCustomPosition: false,
                onDetailsClick: handleDetailsClick,
                onNavigateClick: handleNavigateClick,
              },
              position: { x: 0, y: 0 },
            };

            setOrphanNodes((prev) => [...prev, newNode]);

            setAddModal({ isOpen: false, position: null, isInsertion: false });
            setIsDrawerOpen(true);
          }
        }
      } catch (error) {
        console.error("Failed to save new node:", error);
        setLoading(false);
      }
    },
    [
      addModal,
      insertionEdge,
      nodes,
      setOrphanNodes,
      setIsDrawerOpen,
      rootId,
      handleDetailsClick,
      handleNavigateClick,
    ]
  );

  const handleOptimisticDelete = useCallback(
    (id, type) => {
      pushStateToHistory();

      try {
        if (type === MISC.DEVICE) {
          const nodeToDelete = nodes.find((n) => n.id === id);
          if (!nodeToDelete) return;

          if (id === dynamicRootId) {
            localStorage.removeItem("dynamicRootId");
            setDynamicRootId(null);
          }
          const nodeInfo = {
            name: nodeToDelete.data.name,
            sw_id: nodeToDelete.data.sw_id,
          };

          setDeletedNodes((prev) => [...prev, nodeInfo]);
          setNodes((nds) => nds.filter((n) => n.id !== id));
          setEdges((eds) =>
            eds.filter((e) => e.source !== id && e.target !== id)
          );
        } else {
          const edgeToDelete = edges.find((e) => e.id === id);
          const targetNode = nodes.find((n) => n.id === edgeToDelete.target);
          if (!edgeToDelete || !targetNode) return;

          const edgeInfo = {
            name: targetNode.data.name,
            source_id: parseInt(edgeToDelete.source, 10),
            sw_id: targetNode.data.sw_id,
          };

          setDeletedEdges((prev) => [...prev, edgeInfo]);
          setEdges((eds) => eds.filter((e) => e.id !== id));
        }
      } catch (error) {
        console.error(`Failed to optimistically delete ${type}:`, error);
        toast.error(`Failed to delete item locally: ${error.message}`);
      }
    },
    [
      nodes,
      edges,
      dynamicRootId,
      pushStateToHistory,
      setNodes,
      setEdges,
      setDeletedNodes,
      setDeletedEdges,
    ]
  );

  const handleConfirmDelete = useCallback(async () => {
    const { id, type } = deleteModal;
    try {
      if (type === MISC.DEVICE) {
        const nodeToDelete = nodes.find((n) => n.id === id);
        if (!nodeToDelete) return;

        if (id === dynamicRootId) {
          localStorage.removeItem("dynamicRootId");
          setDynamicRootId(null);
        }
        const nodeInfo = {
          name: nodeToDelete.data.name,
          sw_id: nodeToDelete.data.sw_id,
        };

        await deleteNode(nodeInfo);
        window.location.reload();
      } else {
        const edgeToDelete = edges.find((e) => e.id === id);
        const targetNode = nodes.find((n) => n.id === edgeToDelete.target);
        if (!edgeToDelete || !targetNode) return;

        const edgeInfo = {
          name: targetNode.data.name,
          source_id: parseInt(edgeToDelete.source, 10),
          sw_id: targetNode.data.sw_id,
        };

        await deleteEdge(edgeInfo);
        window.location.reload();
      }
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
    } finally {
      setDeleteModal({ isOpen: false, id: null, type: "" });
    }
  }, [deleteModal, edges, nodes, dynamicRootId]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const dataString = event.dataTransfer.getData("application/reactflow");
      if (!dataString) {
        return;
      }

      const nodeData = JSON.parse(dataString);

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: nodeData.id,
        type: nodeData.type,
        position,
        data: {
          ...nodeData.data,
          hasCustomPosition: true,
          position_x: position.x,
          position_y: position.y,
          position_mode: 1,
          onDetailsClick: handleDetailsClick,
          onNavigateClick: handleNavigateClick,
        },
      };

      setNodes((nds) => nds.concat(newNode));

      initialNodesRef.current.push(newNode);

      setOrphanNodes((nds) => nds.filter((n) => n.id !== nodeData.id));

      setIsEditMode(true);

      toast.info("Edit mode enabled.");

      saveNodeInfo(
        {
          original_name: nodeData.data.name,
          sw_id: nodeData.data.sw_id,
          position_x: position.x,
          position_y: position.y,
          position_mode: 1,
        },
        true
      );

      toast.success(`Added ${nodeData.data.name} to the diagram.`);
    },
    [
      reactFlowInstance,
      setNodes,
      setOrphanNodes,
      handleDetailsClick,
      handleNavigateClick,
    ]
  );

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

        let newNodes;
        setNodes((nds) => {
          newNodes = nds.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    ...updatedFormData,
                    label: updatedFormData.name || n.data.label,
                    name: updatedFormData.name || n.data.name,
                    icon: updatedFormData.node_type
                      ? getNodeIcon(updatedFormData.node_type)
                      : n.data.icon,
                  },
                }
              : n
          );
          return newNodes;
        });

        if (updatedFormData.cable_color !== undefined) {
          setEdges((eds) =>
            eds.map((edge) => {
              if (edge.target === nodeId) {
                return {
                  ...edge,
                  style: {
                    ...edge.style,
                    stroke: updatedFormData.cable_color || "#1e293b",
                  },
                };
              }
              return edge;
            })
          );
        }

        initialNodesRef.current = newNodes;
      } catch (error) {
        console.error("Error saving node info:", error);
      }
    },
    [nodes, reactFlowInstance, setNodes, setEdges]
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
          zIndex: isEditMode ? 1000 : 0,
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
          nameSwIdToNodeIdMap.set(key, String(item.id));
        });

        const initialEdges = [];
        apiData.forEach((item) => {
          if (item.parent_id !== null && item.parent_id !== 0) {
            const identityKey = `${item.name}-${item.sw_id ?? -1}`;
            let targetId = nameSwIdToNodeIdMap.has(identityKey)
              ? nameSwIdToNodeIdMap.get(identityKey)
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

        const parentNodeIds = new Set(initialEdges.map((edge) => edge.source));

        const initialNodes = Array.from(uniqueNodesMap.values()).map((item) => {
          const nodeId =
            item.node_type === NODE_TYPES_ENUM.ONU && item.name && item.sw_id
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

          // Find ALL root nodes (the main one, plus orphan tree roots)
          const orphanRoots = initialNodes.filter(
            (n) =>
              n.id !== (rootNode ? rootNode.id : null) && // Not the main root
              !n.data.hasCustomPosition && // Not manually placed
              (n.data.parent_id === null || n.data.parent_id === 0) && // Is a root
              parentNodeIds.has(n.id) // And is a parent
          );

          setDiagramRoots({ main: rootNode, sub: orphanRoots });

          const allRoots = [rootNode, ...orphanRoots].filter(Boolean);

          // Set levels for all nodes in all trees
          allRoots.forEach((root) => {
            // Check if level is already set (e.g., rootNode might be null but its tree set by dynamicRootId)
            if (root.level !== -1) return;

            root.level = 0; // Set this root to level 0
            const queue = [root];
            let head = 0;
            while (head < queue.length) {
              const parent = queue[head++];
              initialNodes.forEach((potentialChild) => {
                if (String(potentialChild.data.parent_id) === parent.id) {
                  if (potentialChild.level === -1) {
                    // Only set if not already set
                    potentialChild.level = parent.level + 1;
                    queue.push(potentialChild);
                  }
                }
              });
            }
          });

          // 3. Now, filter that list *again* to find just the ones
          //    we want to auto-layout (not manual AND are parents).
          const autoLayoutOrphanRoots = initialNodes.filter(
            (n) =>
              (n.data.parent_id === null || n.data.parent_id === 0) && // Is a root
              n.id !== (rootNode ? rootNode.id : null) && // Not main root
              !n.data.hasCustomPosition && // Not manually placed
              parentNodeIds.has(n.id) // And is a parent
          );

          // 4. The list for the layout logic remains the same as before.
          const allRootsForLayout = [rootNode, ...autoLayoutOrphanRoots].filter(
            Boolean
          );

          // 💡 --- END OF REPLACEMENT BLOCK --- 💡

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

              // 💡 --- THIS IS THE FIX ---
              // All auto-positioned nodes should start at x: 0
              node.position = {
                x: 0,
                y:
                  (manuallyPositionedOrphanCount + autoOrphanIndex) *
                  GRID_Y_SPACING,
              };
              // 💡 --- END OF FIX ---
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

          function getMinY(node, nodeMap, getBranchChildren, getGridChildren) {
            if (!node || !node.position) return Infinity;

            let minY = node.position.y;

            const allChildren = [
              ...getBranchChildren(node.id),
              ...getGridChildren(node.id),
            ];

            allChildren.forEach((childRef) => {
              const childNode = nodeMap.get(childRef.id);
              if (childNode) {
                minY = Math.min(
                  minY,
                  getMinY(
                    childNode,
                    nodeMap,
                    getBranchChildren,
                    getGridChildren
                  )
                );
              }
            });
            return minY;
          }

          const orphanTreeNodes = new Set();
          let currentGlobalY = 0; // This will track where to place the next tree

          // Layout each tree and stack it vertically
          allRootsForLayout.forEach((root) => {
            // 1. Layout the tree (it will be centered at y=0)
            const treeHeight = layoutBranch(root);

            // 2. Find the top of this newly laid-out tree
            const minY = getMinY(
              root,
              nodeMap,
              getBranchChildren,
              getGridChildren
            );

            // 3. Shift the entire tree down to stack it
            // We shift by -minY to bring its top to y=0
            // Then we shift it by currentGlobalY to place it
            const yOffset = currentGlobalY - minY;
            offsetBranch(root, yOffset);

            // 4. Update the global Y offset for the next tree
            currentGlobalY += treeHeight + PADDING_BETWEEN_GRIDS;

            // 5. Add all nodes from this tree to the set
            const queue = [root];
            orphanTreeNodes.add(root.id);
            let head = 0;
            while (head < queue.length) {
              const parent = queue[head++];
              initialNodes.forEach((potentialChild) => {
                if (String(potentialChild.data.parent_id) === parent.id) {
                  if (!orphanTreeNodes.has(potentialChild.id)) {
                    orphanTreeNodes.add(potentialChild.id);
                    queue.push(potentialChild);
                  }
                }
              });
            }
          });

          // Now, separate the nodes for the diagram vs. the drawer
          const diagramNodes = [];
          const orphanDrawerNodes = [];

          initialNodes.forEach((node) => {
            if (
              node.level !== -1 || // In main tree (if mainRoot existed)
              node.data.hasCustomPosition || // Manually placed
              orphanTreeNodes.has(node.id) // In a plotted orphan tree
            ) {
              diagramNodes.push(node);
            } else {
              orphanDrawerNodes.push(node);
            }
          });

          // 💡 --- ADD THIS NEW BLOCK --- 💡
          //
          // Find all roots that are VISIBLE on the diagram
          const diagramOrphanRoots = diagramNodes.filter(
            (n) =>
              // It's a root
              (n.data.parent_id === null || n.data.parent_id === 0) &&
              // And it's NOT the main root node
              n.id !== (rootNode ? rootNode.id : null)
          );
          // Set the search box state using only visible nodes
          setDiagramRoots({ main: rootNode, sub: diagramOrphanRoots });
          // 💡 --- END OF NEW BLOCK --- 💡

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

          setNodes(diagramNodes);
          setOrphanNodes(orphanDrawerNodes);
          setEdges(initialEdges);
          initialNodesRef.current = diagramNodes;

          setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.3, duration: 500 });
          }, 300);
        } else {
          setNodes([]);
          setOrphanNodes([]);
          setEdges([]);
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [rootId, dynamicRootId, navigate, reactFlowInstance]);

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
    <div
      style={{ width: "100vw", height: "100vh" }}
      ref={reactFlowWrapper}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
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
        onNodeClick={onNodeClick}
        onSelectionChange={onSelectionChange}
        selectionOnDrag={true}
        elevateEdgesOnSelect={true}
        elevateNodesOnSelect={false}
        nodeTypes={nodeTypes}
      >
        <Background variant="dots" gap={12} size={1} />
        {contextMenu && (
          <ContextMenu {...contextMenu} onAction={handleAction} />
        )}
      </ReactFlow>
      <UserStatus />

      {!isDrawerOpen && (
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed top-16 left-0 z-10 px-2 py-8 bg-blue-500 rounded-r-md shadow-md hover:bg-blue-600 transition-all duration-200 text-white"
          title="Open Inventory"
        >
          {UI_ICONS.chevronRight_main}
        </button>
      )}

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
        <div className="absolute top-4 left-0 p-2 z-10 text-gray-700">
          <button
            className=""
            title={"Go Back"}
            onClick={() => window.location.replace("/")}
          >
            {UI_ICONS.chevronLeft}
          </button>
        </div>
      )}

      {!isEmpty && (
        <>
          <SearchControl
            nodes={nodes}
            onNodeFound={onNodeFound}
            diagramRoots={diagramRoots}
          />

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
      <Suspense fallback={<LoadingOverlay />}>
        <OrphanDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          nodes={orphanNodes}
        />
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
        <ConfirmSaveModal
          isOpen={isSaveConfirmModalOpen}
          onClose={() => setIsSaveConfirmModalOpen(false)}
          onConfirm={handleConfirmSave}
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
                  resetConfirmModal.scope === MISC.MANUAL
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
      </Suspense>
    </div>
  );
};

export default NetworkDiagram;
