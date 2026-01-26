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
import {
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlow,
  useReactFlow,
  Background,
  MarkerType,
  getNodesBounds,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toPng } from "html-to-image";
import { UI_ICONS } from "../utils/icons";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import {
  fetchData,
  getDescendants,
  saveNodePosition,
  deleteNode,
  deleteEdge,
  createNode,
  insertNode,
  resetPositions,
  createEdge,
} from "../utils/graphUtils";
import useCustomerSearchIndex from "../utils/useCustomerSearchIndex";
import { ACTIONS, NODE_TYPES_ENUM, MISC } from "../utils/enums";
import CustomNode from "../components/CustomNode.jsx";
import ContextMenu from "../components/ContextMenu.jsx";
import UserStatus from "../components/ui/UserStatus";
import ResetViewFab from "../components/ui/ResetViewFab.jsx";
import AddNodeFab from "../components/ui/AddNodeFab.jsx";
import TraceRouteFab from "../components/ui/TraceRouteFab.jsx";
import EditFab from "../components/ui/EditFab.jsx";
import SelectRootNodeFab from "../components/ui/SelectRootNodeFab.jsx";
import ToggleEdgeLabelsFab from "../components/ui/ToggleEdgeLabelsFab.jsx";
import ResetPositionsFab from "../components/ui/ResetPositionsFab.jsx";
import UndoFab from "../components/ui/UndoFab.jsx";
import SearchControl from "../components/ui/SearchControl.jsx";
import IconDock from "../components/ui/IconDock.jsx";
import ToggleMiniMapFab from "../components/ui/ToggleMiniMapFab.jsx";
import HelpBox from "../components/ui/HelpBox.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import DownloadImageFab from "../components/ui/DownloadImageFab.jsx";
import ThemeToggleFab from "../components/ui/ThemeToggleFab.jsx";
import LoadingOverlay from "../components/ui/LoadingOverlay.jsx";
import VerticalIconDock from "../components/ui/VerticalIconDock.jsx";
import ChangelogModal from "../components/modals/ChangelogModal.jsx";
import { nodeColors } from "../utils/constants.js";
import FloatingEdge from "../components/ui/FloatingEdge.jsx";
import FloatingConnectionLine from "../components/ui/FloatingConnectionLine.jsx";

const WelcomeModal = lazy(
  () => import("../components/modals/WelcomeModal.jsx"),
);
const CustomerDetailModal = lazy(
  () => import("../components/modals/CustomerDetailModal.jsx"),
);
const NodeDetailModal = lazy(
  () => import("../components/modals/NodeDetailModal.jsx"),
);
const ConfirmExportModal = lazy(
  () => import("../components/modals/ConfirmExportModal.jsx"),
);
const AddNodeModal = lazy(
  () => import("../components/modals/AddNodeModal.jsx"),
);
const EditNodeModal = lazy(
  () => import("../components/modals/EditNodeModal.jsx"),
);
const ConfirmResetModal = lazy(
  () => import("../components/modals/ConfirmResetModal.jsx"),
);
const ConfirmDeleteModal = lazy(
  () => import("../components/modals/ConfirmDeleteModal.jsx"),
);
const SelectRootNodeModal = lazy(
  () => import("../components/modals/SelectRootNodeModal.jsx"),
);
const ConfirmSaveModal = lazy(
  () => import("../components/modals/ConfirmSaveModal.jsx"),
);
const EditEdgeModal = lazy(
  () => import("../components/modals/EditEdgeModal.jsx"),
);
const TracePathModal = lazy(
  () => import("../components/modals/TracePathModal.jsx"),
);
const OrphanDrawer = lazy(() => import("../components/ui/OrphanDrawer.jsx"));
const ConfirmLogoutModal = lazy(
  () => import("../components/modals/ConfirmLogoutModal.jsx"),
);

const NODES_PER_COLUMN = 8;
const GRID_X_SPACING = 300;
const GRID_Y_SPACING = 80;
const PADDING_BETWEEN_GRIDS = 50;
const NODE_WIDTH = 250;
const NODE_HEIGHT = 60;
const API_DEFAULT_COLOR = "#1e293b";
const EDGE_COLOR_DARK_MODE = "#cbd5e1";

const edgeTypes = {
  floating: FloatingEdge,
};

const NetworkDiagram = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useReactFlow();
  const initialNodesRef = useRef([]);
  const { customerIndex } = useCustomerSearchIndex();

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const [colorMode, setColorMode] = useState(() => {
    return localStorage.getItem("colorMode") || "dark";
  });
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [orphanNodes, setOrphanNodes] = useState([]);
  const [newConnections, setNewConnections] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [showEdgeLabels, setShowEdgeLabels] = useState(() => {
    const saved = localStorage.getItem("showEdgeLabels");
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [isSelectRootModalOpen, setSelectRootModalOpen] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, node: null });
  const [editEdgeModal, setEditEdgeModal] = useState({
    isOpen: false,
    edgeId: null,
  });
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
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [rootId, setRootId] = useState(() => (id ? parseInt(id, 10) : null));
  const [dynamicRootId, setDynamicRootId] = useState(() =>
    id ? null : localStorage.getItem(MISC.DYNAMIC_ROOT_ID),
  );
  const [loading, setLoading] = useState(() => {
    const initialRoot = id ? parseInt(id, 10) : null;
    if (initialRoot !== null) {
      return true;
    }
    const initialDynamic = localStorage.getItem(MISC.DYNAMIC_ROOT_ID);
    return !!initialDynamic;
  });
  const [isEmpty, setIsEmpty] = useState(false);
  const [diagramRoots, setDiagramRoots] = useState({ main: null, sub: [] });
  const [customerModalNode, setCustomerModalNode] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [history, setHistory] = useState([]);
  const [highlightedPath, setHighlightedPath] = useState(null);
  const [deletedNodes, setDeletedNodes] = useState([]);
  const [deletedEdges, setDeletedEdges] = useState([]);
  const [insertionEdge, setInsertionEdge] = useState(null);
  const [isSaveConfirmModalOpen, setIsSaveConfirmModalOpen] = useState(false);
  const [redirectInfo, setRedirectInfo] = useState({
    shouldRedirect: false,
    message: "",
  });
  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);

  const onEdgeMouseEnter = useCallback((event, edge) => {
    setHoveredEdgeId(edge.id);
  }, []);

  const onEdgeMouseLeave = useCallback(() => {
    setHoveredEdgeId(null);
  }, []);

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
        orphanNodes: orphanNodes,
        newConnections: newConnections,
        deletedNodes: deletedNodes,
        deletedEdges: deletedEdges,
      },
    ]);
  }, [
    reactFlowInstance,
    newConnections,
    deletedNodes,
    deletedEdges,
    orphanNodes,
  ]);

  const handleHighlightPath = useCallback(
    (startNodeId) => {
      const pathNodeIds = new Set([startNodeId]);
      const pathEdgeIds = new Set();
      const queue = [startNodeId];
      const visited = new Set([startNodeId]);

      while (queue.length > 0) {
        const currentId = queue.shift();
        const incomingEdges = edges.filter((e) => e.target === currentId);

        incomingEdges.forEach((edge) => {
          pathEdgeIds.add(edge.id);
          const parentId = edge.source;
          if (!visited.has(parentId)) {
            visited.add(parentId);
            pathNodeIds.add(parentId);
            queue.push(parentId);
          }
        });
      }
      setHighlightedPath({ nodes: pathNodeIds, edges: pathEdgeIds });
      toast.info("Path highlighted. Click anywhere on the diagram to clear.", {
        autoClose: 3000,
        toastId: "highlight-toast",
      });
    },
    [edges],
  );

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser({ firstName: decodedToken.first_name || decodedToken.sub });
      } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login", {
      state: { message: "You have been logged out successfully." },
      replace: true,
    });
  };

  const handleShowCustomers = useCallback((nodeData) => {
    setCustomerModalNode(nodeData);
  }, []);

  const handleEdgeUpdate = useCallback(
    (edgeId, fieldName, newValue) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === `e-${edgeId}`) {
            const newEdge = { ...edge };
            if (fieldName === "cable_desc") {
              newEdge.label = newValue;
            } else if (fieldName === "cable_color") {
              newEdge.style = {
                ...newEdge.style,
                stroke: newValue,
                strokeWidth: 3,
              };
            }
            return newEdge;
          }
          return edge;
        }),
      );
    },
    [setEdges],
  );

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    setHistory((prevHistory) => {
      const newHistory = [...prevHistory];
      const lastState = newHistory.pop();
      if (lastState) {
        setNodes(lastState.nodes);
        setEdges(lastState.edges);
        setOrphanNodes(lastState.orphanNodes);
        setDeletedNodes(lastState.deletedNodes);
        setDeletedEdges(lastState.deletedEdges);
        setNewConnections(lastState.newConnections);
      }
      return newHistory;
    });
  }, [history, setNodes, setEdges, setNewConnections]);

  const handleDetailsClick = useCallback((nodeData) => {
    setDetailModal({ isOpen: true, node: { data: nodeData } });
  }, []);

  const onDownload = useCallback(() => {
    if (!reactFlowWrapper.current) {
      toast.error("Diagram element not found.");
      return;
    }
    const elementToCapture = reactFlowWrapper.current.querySelector(
      ".react-flow__viewport",
    );
    if (!elementToCapture) {
      toast.error("Diagram viewport not found.");
      return;
    }
    setIsDownloading(true);
    setTimeout(() => {
      const nodesToCapture = reactFlowInstance.getNodes();
      if (nodesToCapture.length === 0) {
        toast.error("No nodes to capture.");
        setIsDownloading(false);
        toast.dismiss("export-toast");
        return;
      }
      const nodesBounds = getNodesBounds(nodesToCapture);
      const padding = 100;
      const scaleFactor = 2;
      const imageWidth = (nodesBounds.width + padding * 2) * scaleFactor;
      const imageHeight = (nodesBounds.height + padding * 2) * scaleFactor;
      const translateX = -nodesBounds.x + padding;
      const translateY = -nodesBounds.y + padding;

      const getTimestamp = () => {
        const pad = (num) => String(num).padStart(2, "0");
        const now = new Date();
        const year = now.getFullYear();
        const month = pad(now.getMonth() + 1);
        const day = pad(now.getDate());
        const hours = pad(now.getHours());
        const minutes = pad(now.getMinutes());
        const seconds = pad(now.getSeconds());
        return `${hours}.${minutes}.${seconds}-${year}_${month}_${day}`;
      };

      let filename = "";
      if (rootId) {
        const oltNode = nodes.find((n) => n.id === String(rootId));
        const oltName = oltNode?.data?.label || "olt";
        const sanitizedOltName = oltName.replace(/ /g, "_").toLowerCase();
        filename = `${sanitizedOltName}_diagram_${getTimestamp()}.png`;
      } else {
        filename = `main_diagram_${getTimestamp()}.png`;
      }
      toPng(elementToCapture, {
        backgroundColor: "#ffffff",
        width: imageWidth,
        height: imageHeight,
        style: {
          width: imageWidth,
          height: imageHeight,
          transform: `scale(${scaleFactor}) translate(${translateX}px, ${translateY}px)`,
        },
        filter: (node) => {
          if (
            node?.classList?.contains("diagram-ui-overlay") ||
            node?.classList?.contains("fab-button") ||
            node?.classList?.contains("fab-dock") ||
            node?.classList?.contains("react-flow__controls")
          ) {
            return false;
          }
          return true;
        },
      })
        .then((dataUrl) => {
          const a = document.createElement("a");
          a.setAttribute("download", filename);
          a.setAttribute("href", dataUrl);
          a.click();
        })
        .catch((err) => {
          console.error("Failed to export diagram:", err);
          toast.error("Sorry, failed to export the diagram.");
        })
        .finally(() => {
          setIsDownloading(false);
        });
    }, 100);
  }, [reactFlowInstance, reactFlowWrapper, rootId, nodes]);

  const handleExportClick = () => {
    if (isDownloading) return;
    setIsExportModalOpen(true);
  };

  const handleNavigateClick = useCallback(
    (nodeId) => {
      navigate(`/${nodeId}`);
    },
    [navigate],
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
    toast.info("Saving...");

    const originalNodes = initialNodesRef.current;
    const currentNodes = reactFlowInstance.getNodes();
    const originalNodeMap = new Map(
      originalNodes.map((node) => [node.id, node]),
    );

    const movedNodes = currentNodes.filter((currentNode) => {
      const originalNode = originalNodeMap.get(currentNode.id);
      if (rootId && String(currentNode.id) === String(rootId)) {
        return false;
      }
      return (
        originalNode &&
        (currentNode.position.x !== originalNode.position.x ||
          currentNode.position.y !== originalNode.position.y)
      );
    });

    try {
      const deleteEdgeFns = deletedEdges.map(
        (edgeId) => () => deleteEdge(edgeId, true),
      );
      const deleteNodeFns = deletedNodes.map(
        (nodeId) => () => deleteNode(nodeId, true),
      );
      const createConnectionFns = newConnections.map((connParams) => () => {
        return createEdge(connParams, true);
      });
      const savePositionFns = movedNodes.map((node) => () => {
        return saveNodePosition(
          node.id,
          {
            position_x: node.position.x,
            position_y: node.position.y,
            position_mode: 1,
          },
          true,
        );
      });

      console.log("Saving changes sequentially...");
      for (const fn of deleteEdgeFns) await fn();
      for (const fn of deleteNodeFns) await fn();
      for (const fn of savePositionFns) await fn();
      for (const fn of createConnectionFns) await fn();

      toast.success("All changes saved successfully!");
      setNewConnections([]);
      setDeletedNodes([]);
      setDeletedEdges([]);
      setHistory([]);
      initialNodesRef.current = reactFlowInstance.getNodes();
      setIsEditMode(false);
    } catch (error) {
      console.error("Failed to save changes sequentially:", error);
      toast.error(
        error.response?.data?.detail ||
          "A failure occurred during save. Some changes may not have been saved. Please reload.",
      );
    }
  }, [
    reactFlowInstance,
    deletedNodes,
    deletedEdges,
    newConnections,
    setDeletedNodes,
    setDeletedEdges,
    setHistory,
    setIsEditMode,
    setLoading,
    setNewConnections,
    setIsSaveConfirmModalOpen,
  ]);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setIsEmpty(false);
    try {
      const apiData = await fetchData(rootId);
      const isGeneralView = rootId === null;

      if (!isGeneralView && apiData.length > 0) {
        const rootNodeFromData = apiData.find(
          (item) => String(item.id) === String(rootId),
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
        if (
          item.parent_id !== null &&
          item.parent_id !== 0 &&
          item.edge_id !== null
        ) {
          const identityKey = `${item.name}-${item.sw_id ?? -1}`;
          let targetId = nameSwIdToNodeIdMap.has(identityKey)
            ? nameSwIdToNodeIdMap.get(identityKey)
            : String(item.id);

          if (targetId) {
            let strokeColor = item.cable_color || API_DEFAULT_COLOR;
            if (colorMode === "dark" && strokeColor === API_DEFAULT_COLOR) {
              strokeColor = EDGE_COLOR_DARK_MODE;
            }
            initialEdges.push({
              id: `e-${item.edge_id}`,
              source: String(item.parent_id),
              target: targetId,
              type: "floating",
              markerEnd: { type: MarkerType.ArrowClosed },
              style: {
                stroke: strokeColor,
                strokeWidth: 3,
              },
              label: item.cable_desc,
              labelStyle: { fontSize: "10px", fill: "#333", fontWeight: 600 },
              labelBgStyle: {
                fill: "rgba(255, 255, 255, 0.7)",
                padding: "2px 4px",
                borderRadius: "2px",
              },
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

        return {
          id: nodeId,
          type: "custom",
          data: {
            ...item,
            label: item.name || `Node ${item.id}`,
            icon: getNodeIcon(item.node_type),
            onDetailsClick: handleDetailsClick,
            onNavigateClick: handleNavigateClick,
            onShowCustomers: handleShowCustomers,
          },
          position:
            item.position_mode === 1
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
              node.data.position_mode = 0;
              node.draggable = false;
              node.position = { x: 0, y: 0 };
            }
          });
        }
        initialNodes.sort(compareNodesByLabel);
        const nodeMap = new Map(initialNodes.map((n) => [n.id, n]));
        let rootNode = null;
        if (!isGeneralView) {
          rootNode = initialNodes.find(
            (n) => String(n.data.id) === String(rootId),
          );
        } else if (dynamicRootId) {
          rootNode = initialNodes.find(
            (n) => String(n.id) === String(dynamicRootId),
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

        const orphanRoots = initialNodes.filter(
          (n) =>
            n.id !== (rootNode ? rootNode.id : null) &&
            n.data.position_mode !== 1 &&
            (n.data.parent_id === null || n.data.parent_id === 0) &&
            parentNodeIds.has(n.id),
        );
        setDiagramRoots({ main: rootNode, sub: orphanRoots });
        const allRoots = [rootNode, ...orphanRoots].filter(Boolean);

        allRoots.forEach((root) => {
          if (root.level !== -1) return;
          root.level = 0;
          const queue = [root];
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
        });

        const autoLayoutOrphanRoots = initialNodes.filter(
          (n) =>
            (n.data.parent_id === null || n.data.parent_id === 0) &&
            n.id !== (rootNode ? rootNode.id : null) &&
            n.data.position_mode !== 1 &&
            parentNodeIds.has(n.id),
        );
        const allRootsForLayout = [rootNode, ...autoLayoutOrphanRoots].filter(
          Boolean,
        );
        const manuallyPositionedOrphanCount = initialNodes.filter(
          (n) => n.level === -1 && n.data.position_mode === 1,
        ).length;

        initialNodes.forEach((node) => {
          if (node.data.position_mode === 1) {
            return;
          }
          if (node.level !== -1) {
            node.position = { x: node.level * GRID_X_SPACING, y: 0 };
          } else {
            const autoOrphanIndex = initialNodes
              .filter((n) => n.level === -1 && n.data.position_mode !== 1)
              .indexOf(node);
            node.position = {
              x: 0,
              y:
                (manuallyPositionedOrphanCount + autoOrphanIndex) *
                GRID_Y_SPACING,
            };
          }
        });

        const gridNodeType = NODE_TYPES_ENUM.ONU;
        const nodeHeight = 60;
        const getGridChildren = (parentId) => {
          return initialNodes.filter(
            (n) =>
              String(n.data.parent_id) === parentId &&
              n.data.node_type === gridNodeType,
          );
        };
        const getBranchChildren = (parentId) => {
          return initialNodes
            .filter(
              (n) =>
                String(n.data.parent_id) === parentId &&
                n.data.node_type !== gridNodeType,
            )
            .map((n) => nodeMap.get(n.id))
            .filter(Boolean);
        };

        function offsetBranch(node, offsetY) {
          if (!node || !node.position) return;
          if (node.data.position_mode !== 1) {
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
              layoutBranch(child),
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
              if (nodeToUpdate && nodeToUpdate.data.position_mode !== 1) {
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
          if (node.data.position_mode !== 1) {
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
                getMinY(childNode, nodeMap, getBranchChildren, getGridChildren),
              );
            }
          });
          return minY;
        }

        const orphanTreeNodes = new Set();
        let currentGlobalY = 0;
        allRootsForLayout.forEach((root) => {
          const treeHeight = layoutBranch(root);
          const minY = getMinY(
            root,
            nodeMap,
            getBranchChildren,
            getGridChildren,
          );
          const yOffset = currentGlobalY - minY;
          offsetBranch(root, yOffset);
          currentGlobalY += treeHeight + PADDING_BETWEEN_GRIDS;
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

        const diagramNodes = [];
        const orphanDrawerNodes = [];
        initialNodes.forEach((node) => {
          if (
            node.level !== -1 ||
            node.data.position_mode === 1 ||
            orphanTreeNodes.has(node.id)
          ) {
            diagramNodes.push(node);
          } else {
            orphanDrawerNodes.push(node);
          }
        });

        const diagramOrphanRoots = diagramNodes.filter(
          (n) =>
            (n.data.parent_id === null || n.data.parent_id === 0) &&
            n.id !== (rootNode ? rootNode.id : null),
        );
        setDiagramRoots({ main: rootNode, sub: diagramOrphanRoots });

        const nodesToSave = initialNodes.filter((n) => {
          const shouldSave =
            (n.data.position_mode === null ||
              n.data.position_mode === undefined) &&
            n.level !== -1;
          const isRootNodeInOltView =
            !isGeneralView && String(n.data.id) === String(rootId);
          return shouldSave && !isRootNodeInOltView;
        });

        if (nodesToSave.length > 0) {
          console.log(
            `Auto-saving calculated positions for ${nodesToSave.length} nodes...`,
          );
          const autoSavePromises = nodesToSave.map((node) => {
            return saveNodePosition(
              node.id,
              {
                position_x: node.position.x,
                position_y: node.position.y,
                position_mode: 0,
              },
              true,
            );
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
          const savedData = localStorage.getItem("react-flow-viewport");
          if (savedData) {
            try {
              const {
                viewport,
                rootId: savedRootId,
                dynamicRootId: savedDynamicRootId,
              } = JSON.parse(savedData);
              if (
                savedRootId === rootId &&
                savedDynamicRootId === dynamicRootId
              ) {
                reactFlowInstance.setViewport(viewport, { duration: 0 });
                return;
              }
            } catch (e) {
              console.error("Failed to parse saved viewport:", e);
              localStorage.removeItem("react-flow-viewport");
            }
          }
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
  }, [rootId, dynamicRootId, navigate, reactFlowInstance, handleShowCustomers]);

  const handleResetPositions = useCallback(
    async (scope, nodeId = null) => {
      try {
        const currentNodes = reactFlowInstance.getNodes();
        const currentEdges = reactFlowInstance.getEdges();
        const nodesBeingReset = currentNodes.filter((n) => {
          if (nodeId) return n.id === nodeId;
          if (scope === "manual") return n.data.position_mode === 1;
          return true;
        });
        const unconnectedNodes = nodesBeingReset.filter((n) => {
          const isRoot =
            String(n.id) === String(rootId) ||
            String(n.id) === String(dynamicRootId);
          if (isRoot) return false;
          const hasConnections = currentEdges.some(
            (e) => e.source === n.id || e.target === n.id,
          );
          return !hasConnections;
        });

        const payload = {
          sw_id: rootId ? parseInt(rootId, 10) : null,
          scope: nodeId ? null : scope,
          node_id: nodeId ? parseInt(nodeId, 10) : null,
        };
        await resetPositions(payload);
        await loadInitialData();
        if (unconnectedNodes.length > 0) {
          const names = unconnectedNodes
            .slice(0, 3)
            .map((n) => n.data.label)
            .join(", ");
          const suffix = unconnectedNodes.length > 3 ? "..." : "";
          toast.info(
            `${names}${suffix} sent to inventory (no cables attached).`,
          );
        }
      } catch (error) {
        console.error("Failed to reset positions:", error);
        setLoading(false);
      }
    },
    [rootId, dynamicRootId, reactFlowInstance],
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

  const handleResetView = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.2, duration: 500 });
    localStorage.removeItem("react-flow-viewport");
  }, [reactFlowInstance]);

  const compareNodesByLabel = (a, b) => {
    const numsA = getSortableNumbers(a.data.label);
    const numsB = getSortableNumbers(b.data.label);
    for (let i = 0; i < Math.min(numsA.length, numsB.length); i++) {
      if (numsA[i] !== numsB[i]) return numsA[i] - numsB[i];
    }
    return numsA.length - numsB.length;
  };

  const onNodeDragStart = useCallback(() => {
    if (isEditMode) {
      pushStateToHistory();
    }
  }, [isEditMode, pushStateToHistory]);

  const onConnect = useCallback(
    (params) => {
      if (isEditMode) {
        pushStateToHistory();
      }
      const newEdge = {
        ...params,
        id: `reactflow__edge-${params.source}${params.sourceHandle || ""}-${
          params.target
        }${params.targetHandle || ""}`,
        type: "floating",
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      if (isEditMode) {
        setNewConnections((prev) => [...prev, params]);
      }
    },
    [isEditMode, pushStateToHistory, setEdges, setNewConnections],
  );

  const handleFabClick = useCallback(async () => {
    if (isEditMode) {
      const originalNodes = initialNodesRef.current;
      const currentNodes = reactFlowInstance.getNodes();
      const originalNodeMap = new Map(
        originalNodes.map((node) => [node.id, node]),
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
    deletedNodes,
    deletedEdges,
    reactFlowInstance,
    setIsEditMode,
    setHistory,
    setDeletedNodes,
    setDeletedEdges,
    setIsSaveConfirmModalOpen,
  ]);

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

  const [showMiniMap, setShowMiniMap] = useState(() => {
    const saved = localStorage.getItem("showMiniMap");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("showMiniMap", JSON.stringify(showMiniMap));
  }, [showMiniMap]);

  const onEdgeContextMenu = (event, edge) =>
    handleContextMenu(event, "edge", edge);

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
    if (highlightedPath) {
      setHighlightedPath(null);
    }
  }, [highlightedPath]);

  const onNodeClick = useCallback(
    (event, node) => {
      if (isEditMode) {
        return;
      }
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, data: { ...n.data, isCollapsed: !n.data?.isCollapsed } }
            : n,
        ),
      );
    },
    [setNodes, isEditMode],
  );

  const handleAction = (action, { id }) => {
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
      case ACTIONS.EDIT_EDGE: {
        const numericEdgeId = id.replace("e-", "");
        setEditEdgeModal({ isOpen: true, edgeId: numericEdgeId });
        break;
      }
      case "HIGHLIGHT_PATH": {
        handleHighlightPath(id);
        break;
      }
      case ACTIONS.SEND_TO_INVENTORY: {
        pushStateToHistory();
        const nodeToSend = nodes.find((n) => n.id === id);
        if (nodeToSend) {
          setOrphanNodes((prev) => [...prev, nodeToSend]);
          setNodes((nds) => nds.filter((n) => n.id !== id));
          setEdges((eds) =>
            eds.filter((e) => e.source !== id && e.target !== id),
          );
          saveNodePosition(
            id,
            {
              position_x: null,
              position_y: null,
              position_mode: 0,
            },
            true,
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
    async (formData) => {
      try {
        const { parentNode } = addModal;
        if (addModal.isInsertion && insertionEdge) {
          const originalEdgeRecordId = parseInt(
            insertionEdge.id.replace("e-", ""),
            10,
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
          await loadInitialData();
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
                onDetailsClick: handleDetailsClick,
                onNavigateClick: handleNavigateClick,
                onShowCustomers: handleShowCustomers,
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
      handleShowCustomers,
    ],
  );

  useEffect(() => {
    if (loading || !isEmpty) {
      return;
    }
    const hasSeenGuide = localStorage.getItem("hasSeenWelcomeGuide");
    console.log("Welcome Guide Status:", hasSeenGuide);
    if (hasSeenGuide !== "true") {
      setIsWelcomeOpen(true);
    }
  }, [loading, isEmpty]);

  const handleCloseWelcome = () => {
    setIsWelcomeOpen(false);
    localStorage.setItem("hasSeenWelcomeGuide", "true");
  };

  const handleOptimisticDelete = useCallback(
    (id, type) => {
      pushStateToHistory();
      try {
        if (type === MISC.DEVICE) {
          const nodeToDelete = nodes.find((n) => n.id === id);
          if (!nodeToDelete) return;
          if (id === dynamicRootId) {
            localStorage.removeItem(MISC.DYNAMIC_ROOT_ID);
            setDynamicRootId(null);
          }
          setDeletedNodes((prev) => [...prev, id]);
          setNodes((nds) => nds.filter((n) => n.id !== id));
          setEdges((eds) =>
            eds.filter((e) => e.source !== id && e.target !== id),
          );
        } else {
          const edgeToDelete = edges.find((e) => e.id === id);
          const targetNode = nodes.find((n) => n.id === edgeToDelete.target);
          if (!edgeToDelete || !targetNode) return;
          const edgeId = id.replace("e-", "");
          setDeletedEdges((prev) => [...prev, edgeId]);
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
    ],
  );

  const handleConfirmDelete = useCallback(async () => {
    const { id, type } = deleteModal;
    try {
      if (type === MISC.DEVICE) {
        await deleteNode(id);
        setNodes((nds) => nds.filter((n) => n.id !== id));
        setEdges((eds) =>
          eds.filter((e) => e.source !== id && e.target !== id),
        );
        toast.success("Device deleted.");
      } else {
        const edgeId = id.replace("e-", "");
        await deleteEdge(edgeId);
        setEdges((eds) => eds.filter((e) => e.id !== id));
        toast.success("Connection deleted.");
      }
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
    } finally {
      setDeleteModal({ isOpen: false, id: null, type: "" });
    }
  }, [deleteModal, dynamicRootId]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onMoveEnd = useCallback(() => {
    if (reactFlowInstance) {
      const viewport = reactFlowInstance.getViewport();
      const viewportData = {
        viewport,
        rootId: rootId,
        dynamicRootId: dynamicRootId,
      };
      localStorage.setItem("react-flow-viewport", JSON.stringify(viewportData));
    }
  }, [reactFlowInstance, rootId, dynamicRootId]);

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
          position_x: position.x,
          position_y: position.y,
          position_mode: 1,
          onDetailsClick: handleDetailsClick,
          onNavigateClick: handleNavigateClick,
          onShowCustomers: handleShowCustomers,
        },
      };
      pushStateToHistory();
      setNodes((nds) => nds.concat(newNode));
      initialNodesRef.current.push(newNode);
      setOrphanNodes((nds) => nds.filter((n) => n.id !== nodeData.id));
      let wasAlreadyEditMode = false;
      setIsEditMode((current) => {
        wasAlreadyEditMode = current;
        return true;
      });
      if (!wasAlreadyEditMode) {
        toast.info("Edit mode enabled.");
      }
      saveNodePosition(
        nodeData.id,
        {
          position_x: position.x,
          position_y: position.y,
          position_mode: 1,
        },
        true,
      );
      toast.success(`Added ${nodeData.data.name} to the diagram.`);
    },
    [
      reactFlowInstance,
      setNodes,
      setOrphanNodes,
      handleDetailsClick,
      handleNavigateClick,
      handleShowCustomers,
      pushStateToHistory,
    ],
  );

  const onNodeFound = (nodeId) => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, isHighlighted: n.id === nodeId },
      })),
    );
    reactFlowInstance.fitView({
      nodes: [{ id: nodeId }],
      duration: 500,
      maxZoom: 1.5,
    });
    setTimeout(() => {
      setNodes((nds) =>
        nds.map((n) => ({ ...n, data: { ...n.data, isHighlighted: false } })),
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
          edges,
        );
        hiddenNodeIds.forEach((id) => hidden.nodeIds.add(id));
        hiddenEdgeIds.forEach((id) => hidden.edgeIds.add(id));
      }
    }

    const filteredNodes = allNodes.filter((n) => !hidden.nodeIds.has(n.id));
    const filteredEdges = edges.filter(
      (e) =>
        !hidden.edgeIds.has(e.id) &&
        !hidden.nodeIds.has(e.source) &&
        !hidden.nodeIds.has(e.target),
    );

    const finalNodes = filteredNodes.map((node) => {
      if (!highlightedPath) return node;
      const isInPath = highlightedPath.nodes.has(node.id);
      return {
        ...node,
        style: {
          ...node.style,
          opacity: isInPath ? 1 : 0.1,
          transition: "opacity 0.4s ease",
        },
        zIndex: isInPath ? 1001 : 0,
      };
    });

    const finalEdges = filteredEdges.map((edge) => {
      const isHovered = hoveredEdgeId === edge.id;

      const baseEdge = {
        ...edge,
        interactive: isEditMode,
        zIndex: isHovered ? 2000 : isEditMode ? 1000 : 0,
        className: "network-edge",
        label: showEdgeLabels ? edge.label : undefined,
        labelStyle: { ...edge.labelStyle },
        labelBgStyle: { ...edge.labelBgStyle },
      };

      if (highlightedPath) {
        const isInPath = highlightedPath.edges.has(edge.id);

        if (isHovered) {
          return {
            ...baseEdge,
            animated: isInPath,
            style: {
              ...baseEdge.style,
              stroke: "#3b82f6",
              strokeWidth: 4,
              opacity: 1,
              transition: "all 0.1s ease",
            },
          };
        }

        return {
          ...baseEdge,
          animated: isInPath,
          style: {
            ...baseEdge.style,
            stroke: isInPath ? "#f59e0b" : baseEdge.style?.stroke,
            strokeWidth: isInPath ? 3 : 1,
            opacity: isInPath ? 1 : 0.05,
            transition: "opacity 0.1s ease",
          },
          zIndex: isInPath ? 1000 : -1,
        };
      }

      return baseEdge;
    });

    return {
      visibleNodes: finalNodes,
      visibleEdges: finalEdges,
    };
  }, [
    nodes,
    edges,
    isEditMode,
    showEdgeLabels,
    highlightedPath,
    hoveredEdgeId,
  ]);

  useEffect(() => {
    if (rootId === undefined) {
      return;
    }
    loadInitialData();
  }, [
    rootId,
    dynamicRootId,
    navigate,
    reactFlowInstance,
    handleShowCustomers,
    loadInitialData,
  ]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const activeTag = document.activeElement.tagName;
      const isInputActive = ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (event.shiftKey) {
          handleExportClick();
        } else if (isEditMode) {
          handleFabClick();
        }
        return;
      }
      if (event.key === "Escape") {
        setEditModal({ isOpen: false, node: null });
        setResetConfirmModal({ isOpen: false, scope: null, nodeId: null });
        setDeleteModal({ isOpen: false, id: null, type: "" });
        setEditEdgeModal({ isOpen: false, edgeId: null });
        setAddModal((prev) => ({ ...prev, isOpen: false }));
        setDetailModal({ isOpen: false, node: null });
        setIsTraceModalOpen(false);
        setIsDrawerOpen(false);
        setIsLogoutModalOpen(false);
        setIsExportModalOpen(false);
        setCustomerModalNode(null);
        setContextMenu(null);
        setHighlightedPath(null);
        setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
        setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
        return;
      }
      if (isInputActive) return;
      switch (event.key.toLowerCase()) {
        case "0":
          handleResetView();
          break;
        case "l":
          setShowEdgeLabels((prev) => !prev);
          break;
        case "t":
          setIsTraceModalOpen((prev) => !prev);
          break;
        case "m":
          if (event.shiftKey) return;
          setShowMiniMap((prev) => !prev);
          break;
        case "i":
          setIsDrawerOpen((prev) => !prev);
          break;
        case "r":
          if (event.ctrlKey || event.metaKey) return;
          setResetConfirmModal({
            isOpen: true,
            scope: "all",
            nodeId: null,
            nodeName: "",
          });
          break;
        case "e":
          handleFabClick();
          break;
        case "n":
          handleAddNodeClick();
          break;
        case "z":
          if ((event.ctrlKey || event.metaKey) && isEditMode) {
            handleUndo();
          }
          break;
        case "delete":
        case "backspace":
          if (isEditMode) {
            const selectedNode = nodes.find((n) => n.selected);
            const selectedEdge = edges.find((e) => e.selected);
            if (selectedNode) {
              setDeleteModal({
                isOpen: true,
                id: selectedNode.id,
                type: MISC.DEVICE,
              });
            } else if (selectedEdge) {
              setDeleteModal({
                isOpen: true,
                id: selectedEdge.id,
                type: "connection",
              });
            }
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isEditMode,
    nodes,
    edges,
    handleFabClick,
    handleExportClick,
    handleResetView,
    handleAddNodeClick,
    handleUndo,
  ]);

  useEffect(() => {
    const newRootId = id ? parseInt(id, 10) : null;
    setRootId(newRootId);
    if (newRootId !== null) {
      setDynamicRootId(null);
    } else {
      setDynamicRootId(localStorage.getItem(MISC.DYNAMIC_ROOT_ID));
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
        localStorage.setItem(MISC.DYNAMIC_ROOT_ID, dynamicRootId);
      } else {
        localStorage.removeItem(MISC.DYNAMIC_ROOT_ID);
      }
    }
  }, [dynamicRootId, rootId]);

  useEffect(() => {
    localStorage.setItem("showEdgeLabels", JSON.stringify(showEdgeLabels));
  }, [showEdgeLabels]);

  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem("colorMode", colorMode);
    if (colorMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    setEdges((eds) =>
      eds.map((edge) => {
        const currentColor = edge.style?.stroke;
        if (colorMode === "dark" && currentColor === API_DEFAULT_COLOR) {
          return {
            ...edge,
            style: { ...edge.style, stroke: EDGE_COLOR_DARK_MODE },
          };
        }
        if (colorMode === "light" && currentColor === EDGE_COLOR_DARK_MODE) {
          return {
            ...edge,
            style: { ...edge.style, stroke: API_DEFAULT_COLOR },
          };
        }
        return edge;
      }),
    );
  }, [colorMode, setEdges]);

  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      ref={reactFlowWrapper}
      className="w-screen h-screen bg-slate-50 dark:bg-neutral-950 transition-colors duration-200 ease-in-out"
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
        defaultEdgeOptions={{ updatable: false }}
        onNodeDragStart={onNodeDragStart}
        panOnDrag={!isEditMode}
        deleteKeyCode={null}
        onPaneClick={onPaneClick}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseLeave={onEdgeMouseLeave}
        onNodeClick={onNodeClick}
        selectionOnDrag={true}
        elevateEdgesOnSelect={true}
        elevateNodesOnSelect={false}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineComponent={FloatingConnectionLine}
        onMoveEnd={onMoveEnd}
        colorMode={colorMode}
        style={{ backgroundColor: "transparent" }}
        minZoom={0.05}
        maxZoom={8}
      >
        <Background variant="dots" gap={20} size={1} bgColor="transparent" />
        {showMiniMap && (
          <div className="relative">
            <MiniMap
              position="top-left"
              zoomable
              pannable
              nodeColor={(node) => nodeColors[node.data.node_type] ?? "#e5e7eb"}
              className="pl-6"
              bgColor="transparent"
            />
          </div>
        )}

        {contextMenu && (
          <ContextMenu {...contextMenu} onAction={handleAction} edges={edges} />
        )}
      </ReactFlow>
      <UserStatus
        user={user}
        onLogoutClick={() => setIsLogoutModalOpen(true)}
        className="diagram-ui-overlay"
      />

      {!isDrawerOpen && (
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed top-[84px] left-0 z-10 px-2 py-8 bg-neutral-900/80 hover:bg-neutral-800/80 rounded-r-md dark:bg-white/80 dark:hover:bg-neutral-200/80 transition-all duration-200 text-white dark:text-neutral-600 diagram-ui-overlay"
          title="Open Inventory [I]"
        >
          {UI_ICONS.chevronRight_main}
        </button>
      )}

      {loading && <LoadingOverlay />}
      {isDownloading && (
        <LoadingOverlay message="Exporting diagram... This may take a moment, please wait." />
      )}
      {!loading && isEmpty && (
        <>
          <EmptyState />
          <HelpBox isEmpty={isEmpty} className="diagram-ui-overlay" />
          <IconDock className="fab-dock diagram-ui-overlay">
            <AddNodeFab onClick={handleAddNodeClick} />
          </IconDock>
        </>
      )}

      {window.location.pathname !== "/" && (
        <div className="absolute top-4 left-0 p-2 z-10 text-neutral-700 dark:text-neutral-200 diagram-ui-overlay">
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
            customerIndex={customerIndex}
            className="diagram-ui-overlay"
          />

          <HelpBox isEmpty={isEmpty} className="diagram-ui-overlay" />
          <VerticalIconDock className="diagram-ui-overlay fab-dock">
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
              className="fab-button"
            />
            <ThemeToggleFab
              colorMode={colorMode}
              onToggle={setColorMode}
              className="fab-button"
            />
            <DownloadImageFab
              onClick={handleExportClick}
              disabled={loading || isEmpty}
              isDownloading={isDownloading}
              className="fab-button"
            />
            <ToggleEdgeLabelsFab
              onClick={() => setShowEdgeLabels((prev) => !prev)}
              disabled={loading || isEmpty}
              isLabelsVisible={showEdgeLabels}
              className="fab-button"
            />
            {rootId === null && (
              <SelectRootNodeFab
                onClick={() => setSelectRootModalOpen(true)}
                className="fab-button"
              />
            )}
            <ToggleMiniMapFab
              onClick={() => setShowMiniMap((prev) => !prev)}
              disabled={loading || isEmpty}
              isVisible={showMiniMap}
              className="fab-button"
            />
            <button
              className="fab-button md:hidden bg-[#ef4444] hover:bg-[#d43c3c] text-white p-2 rounded-full transition-all duration-200 flex items-center justify-center w-10 h-10"
              onClick={() => setIsLogoutModalOpen(true)}
              title="Logout"
            >
              {UI_ICONS.signOut}
            </button>
            <TraceRouteFab
              onClick={() => setIsTraceModalOpen(true)}
              disabled={loading || isEditMode}
              className="fab-button"
            />
          </VerticalIconDock>

          <IconDock className="fab-dock diagram-ui-overlay">
            <AddNodeFab onClick={handleAddNodeClick} className="fab-button" />
            <EditFab
              isEditing={isEditMode}
              onClick={handleFabClick}
              className="fab-button"
            />
            <UndoFab
              onClick={handleUndo}
              disabled={history.length === 0}
              className="fab-button"
            />
            <ResetViewFab onClick={handleResetView} className="fab-button" />
          </IconDock>
        </>
      )}
      <ChangelogModal />
      <Suspense fallback={<LoadingOverlay />}>
        <WelcomeModal isOpen={isWelcomeOpen} onClose={handleCloseWelcome} />
        <CustomerDetailModal
          isOpen={!!customerModalNode}
          onClose={() => setCustomerModalNode(null)}
          nodeData={customerModalNode}
        />
        <OrphanDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          nodes={orphanNodes}
        />
        <ConfirmExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onConfirm={() => {
            setIsExportModalOpen(false);
            onDownload();
          }}
        />
        <TracePathModal
          isOpen={isTraceModalOpen}
          onClose={() => setIsTraceModalOpen(false)}
          allNodes={nodes}
          getNodeIcon={getNodeIcon}
        />
        <ConfirmLogoutModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleLogout}
          userName={user?.firstName}
        />
        <EditNodeModal
          isOpen={editModal.isOpen}
          node={editModal.node}
          onClose={() => setEditModal({ isOpen: false, node: null })}
          onSave={async () => {
            await loadInitialData();
            setEditModal({ isOpen: false, node: null });
          }}
          nodes={nodes}
          getNodeIcon={getNodeIcon}
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
          nodes={nodes}
          getNodeIcon={getNodeIcon}
        />
        <EditEdgeModal
          isOpen={editEdgeModal.isOpen}
          edgeId={editEdgeModal.edgeId}
          onClose={() => setEditEdgeModal({ isOpen: false, edgeId: null })}
          onUpdate={handleEdgeUpdate}
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
