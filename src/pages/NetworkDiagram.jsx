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
  useReactFlow,
  Background,
  MarkerType,
  getRectOfNodes,
  getTransformForBounds,
} from "reactflow";
import "reactflow/dist/style.css";
import { toPng } from "html-to-image";
import { UI_ICONS } from "../utils/icons";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
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
import DownloadImageFab from "../components/ui/DownloadImageFab.jsx";
import LoadingOverlay from "../components/ui/LoadingOverlay.jsx";
const CustomerDetailModal = lazy(() =>
  import("../components/modals/CustomerDetailModal.jsx")
);
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
const EditEdgeModal = lazy(() =>
  import("../components/modals/EditEdgeModal.jsx")
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
  const [newConnections, setNewConnections] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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

  const [isEditMode, setIsEditMode] = useState(false);

  // --- MODIFIED INITIALIZATION ---
  const [rootId, setRootId] = useState(() => (id ? parseInt(id, 10) : null));
  const [dynamicRootId, setDynamicRootId] = useState(() =>
    id ? null : localStorage.getItem(MISC.DYNAMIC_ROOT_ID)
  );

  // Initialize loading to true if we have a rootId (OLT page)
  // OR if we are on the main page but have a dynamicRootId to load.
  const [loading, setLoading] = useState(() => {
    const initialRoot = id ? parseInt(id, 10) : null;
    if (initialRoot !== null) {
      return true; // We are on an OLT page, load immediately.
    }
    const initialDynamic = localStorage.getItem(MISC.DYNAMIC_ROOT_ID);
    return !!initialDynamic; // Load if we have a dynamic root, otherwise don't.
  });

  const [isEmpty, setIsEmpty] = useState(false);
  const [diagramRoots, setDiagramRoots] = useState({ main: null, sub: [] });
  const [customerModalNode, setCustomerModalNode] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [history, setHistory] = useState([]);
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
        newConnections: newConnections, // <-- ADD THIS
        deletedNodes: deletedNodes,
        deletedEdges: deletedEdges,
      },
    ]);
  }, [reactFlowInstance, newConnections, deletedNodes, deletedEdges]); // <-- ADD newConnections

  const handleShowCustomers = useCallback((nodeData) => {
    setCustomerModalNode(nodeData);
  }, []);

  const handleEdgeUpdate = useCallback(
    (edgeId, fieldName, newValue) => {
      setEdges((eds) =>
        eds.map((edge) => {
          // Find the edge (ReactFlow ID is "e-123", our ID is 123)
          if (edge.id === `e-${edgeId}`) {
            const newEdge = { ...edge };

            // Update the correct property
            if (fieldName === "cable_desc") {
              newEdge.label = newValue;
            } else if (fieldName === "cable_color") {
              newEdge.style = { ...newEdge.style, stroke: newValue };
            }

            // You can add more 'else if' blocks here for other fields if needed

            return newEdge;
          }
          return edge;
        })
      );
    },
    [setEdges] // Add setEdges to the dependency array
  );

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;

    setHistory((prevHistory) => {
      const newHistory = [...prevHistory];
      const lastState = newHistory.pop();

      if (lastState) {
        setNodes(lastState.nodes);
        setEdges(lastState.edges);
        setDeletedNodes(lastState.deletedNodes);
        setDeletedEdges(lastState.deletedEdges);
        setNewConnections(lastState.newConnections); // <-- ADD THIS
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
      ".react-flow__viewport"
    );

    if (!elementToCapture) {
      toast.error("Diagram viewport not found.");
      return;
    }

    // --- 1. SET LOADING STATE AND TOAST IMMEDIATELY ---
    setIsDownloading(true);
    toast.info("Exporting diagram... This may take a moment, please wait.");

    // --- 2. DEFER THE HEAVY WORK WITH A TIMEOUT ---
    setTimeout(() => {
      // --- 3. ALL HEAVY PROCESSING MOVED INSIDE THE TIMEOUT ---
      const nodesToCapture = reactFlowInstance.getNodes();
      if (nodesToCapture.length === 0) {
        toast.error("No nodes to capture.");
        setIsDownloading(false);
        toast.dismiss("download-toast");
        return;
      }

      // 1. Get bounds (This is the main blocking call)
      const nodesBounds = getRectOfNodes(nodesToCapture);

      // 2. Define padding and scale
      const padding = 100;
      const scaleFactor = 2;

      // 3. Calculate dynamic image dimensions
      const imageWidth = (nodesBounds.width + padding * 2) * scaleFactor;
      const imageHeight = (nodesBounds.height + padding * 2) * scaleFactor;

      // 4. Calculate translation
      const translateX = -nodesBounds.x + padding;
      const translateY = -nodesBounds.y + padding;

      // --- Dynamic Filename Logic ---
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
        // OLT View
        const oltNode = nodes.find((n) => n.id === String(rootId));
        const oltName = oltNode?.data?.label || "olt";
        const sanitizedOltName = oltName.replace(/ /g, "_").toLowerCase();
        filename = `${sanitizedOltName}_diagram_${getTimestamp()}.png`;
      } else {
        // General View
        filename = `main_diagram_${getTimestamp()}.png`;
      }
      // --- End Filename Logic ---

      // --- 4. RUN THE ASYNCHRONOUS PNG CONVERSION ---
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
          toast.dismiss("download-toast");
          toast.success("Diagram export is ready!"); // <-- UPDATED
        })
        .catch((err) => {
          console.error("Failed to export diagram:", err); // <-- UPDATED
          toast.dismiss("download-toast");
          toast.error("Sorry, failed to export the diagram."); // <-- UPDATED
        })
        .finally(() => {
          setIsDownloading(false);
        });
    }, 100); // A 10ms delay is enough to let the UI update
  }, [reactFlowInstance, reactFlowWrapper, rootId, nodes]);

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
    toast.info("Saving...");

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
      // --- MODIFIED ---
      const deleteEdgeFns = deletedEdges.map(
        (edgeId) => () => deleteEdge(edgeId, true)
      );

      // updateConnectionFns removed

      const deleteNodeFns = deletedNodes.map(
        (nodeId) => () => deleteNode(nodeId, true)
      );

      const createConnectionFns = newConnections.map((connParams) => () => {
        return createEdge(connParams, true); // Use the new util
      });

      // --- FIXED PAYLOAD ---
      const savePositionFns = movedNodes.map((node) => () => {
        return saveNodePosition(
          node.id,
          {
            position_x: node.position.x,
            position_y: node.position.y,
            position_mode: 1,
          },
          true // muted
        );
      });
      // --- END FIX ---

      console.log("Saving changes sequentially...");

      console.log(`Deleting ${deleteEdgeFns.length} edges...`);
      for (const fn of deleteEdgeFns) {
        await fn();
      }

      console.log(`Deleting ${deleteNodeFns.length} nodes...`);
      for (const fn of deleteNodeFns) {
        await fn();
      }

      console.log(`Saving ${savePositionFns.length} node positions...`);
      for (const fn of savePositionFns) {
        await fn();
      }

      console.log(`Creating ${createConnectionFns.length} new connections...`);
      for (const fn of createConnectionFns) {
        await fn();
      }

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
          "A failure occurred during save. Some changes may not have been saved. Please reload."
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
        // Check for parent_id AND a valid edge_id
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
            initialEdges.push({
              // --- FIX ---
              // Use the unique edge ID from the database
              id: `e-${item.edge_id}`,
              source: String(item.parent_id),
              target: targetId,
              markerEnd: { type: MarkerType.ArrowClosed },
              style: { stroke: item.cable_color || "#1e293b" },

              // --- ADD THESE LINES ---
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

        const orphanRoots = initialNodes.filter(
          (n) =>
            n.id !== (rootNode ? rootNode.id : null) &&
            n.data.position_mode !== 1 &&
            (n.data.parent_id === null || n.data.parent_id === 0) &&
            parentNodeIds.has(n.id)
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
            parentNodeIds.has(n.id)
        );

        const allRootsForLayout = [rootNode, ...autoLayoutOrphanRoots].filter(
          Boolean
        );

        const manuallyPositionedOrphanCount = initialNodes.filter(
          (n) => n.level === -1 && n.data.position_mode === 1
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
                getMinY(childNode, nodeMap, getBranchChildren, getGridChildren)
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
            getGridChildren
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
            n.id !== (rootNode ? rootNode.id : null)
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
            `Auto-saving calculated positions for ${nodesToSave.length} nodes...`
          );

          const autoSavePromises = nodesToSave.map((node) => {
            // --- MODIFIED ---
            return saveNodePosition(
              node.id,
              {
                position_x: node.position.x,
                position_y: node.position.y,
                position_mode: 0,
              },
              true // for muted
            );
            // --- END MODIFICATION ---
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
        const payload = {
          sw_id: rootId ? parseInt(rootId, 10) : null,
          scope: nodeId ? null : scope,
          node_id: nodeId ? parseInt(nodeId, 10) : null,
        };
        await resetPositions(payload);

        await loadInitialData();
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
        // Use a more unique UI-side ID
        id: `reactflow__edge-${params.source}${params.sourceHandle || ""}-${
          params.target
        }${params.targetHandle || ""}`,
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      setEdges((eds) => addEdge(newEdge, eds));

      // --- ADD THIS LOGIC BACK ---
      if (isEditMode) {
        setNewConnections((prev) => [...prev, params]);
      }
      // --- END ADD ---
    },
    [isEditMode, pushStateToHistory, setEdges, setNewConnections] // <-- Add setNewConnections
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
        newConnections.length > 0 || // <-- ADD THIS
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
      case ACTIONS.EDIT_EDGE: {
        // id is the full edge ID like "e-123"
        const numericEdgeId = id.replace("e-", "");
        setEditEdgeModal({ isOpen: true, edgeId: numericEdgeId });
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

          saveNodePosition(
            id, // Pass the ID
            {
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
            localStorage.removeItem(MISC.DYNAMIC_ROOT_ID);
            setDynamicRootId(null);
          }

          setDeletedNodes((prev) => [...prev, id]);
          setNodes((nds) => nds.filter((n) => n.id !== id));
          setEdges((eds) =>
            eds.filter((e) => e.source !== id && e.target !== id)
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
    ]
  );

  const handleConfirmDelete = useCallback(async () => {
    const { id, type } = deleteModal;
    try {
      if (type === MISC.DEVICE) {
        // ...
        await deleteNode(id); // <-- Call API
        // --- MODIFIED ---
        setNodes((nds) => nds.filter((n) => n.id !== id)); // <-- Update state
        setEdges((eds) =>
          eds.filter((e) => e.source !== id && e.target !== id)
        );
        toast.success("Device deleted.");
        // --- END MODIFICATION ---
      } else {
        // ...
        const edgeId = id.replace("e-", "");
        await deleteEdge(edgeId); // <-- Call API
        // --- MODIFIED ---
        setEdges((eds) => eds.filter((e) => e.id !== id)); // <-- Update state
        toast.success("Connection deleted.");
        // --- END MODIFICATION ---
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

      setNodes((nds) => nds.concat(newNode));
      initialNodesRef.current.push(newNode);
      setOrphanNodes((nds) => nds.filter((n) => n.id !== nodeData.id));

      // --- MODIFIED ---
      // Use the functional form to get the *actual* current state
      let wasAlreadyEditMode = false;
      setIsEditMode((current) => {
        wasAlreadyEditMode = current; // Capture the state *before* setting
        return true; // Always set to true
      });

      // Now the check is against the real value
      if (!wasAlreadyEditMode) {
        toast.info("Edit mode enabled.");
      }
      // --- END MODIFICATION ---

      saveNodePosition(
        nodeData.id, // Pass the ID
        {
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
      handleShowCustomers,
      // isEditMode is no longer needed as a dependency
    ]
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
        onNodeClick={onNodeClick}
        selectionOnDrag={true}
        elevateEdgesOnSelect={true}
        elevateNodesOnSelect={false}
        nodeTypes={nodeTypes}
        onMoveEnd={onMoveEnd}
      >
        <Background variant="dots" gap={12} size={1} />
        {contextMenu && (
          <ContextMenu {...contextMenu} onAction={handleAction} />
        )}
      </ReactFlow>
      <UserStatus className="diagram-ui-overlay" />

      {!isDrawerOpen && (
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed top-16 left-0 z-10 px-2 py-8 bg-blue-500 rounded-r-md  hover:bg-blue-600 transition-all duration-200 text-white diagram-ui-overlay"
          title="Open Inventory"
        >
          {UI_ICONS.chevronRight_main}
        </button>
      )}

      {loading && <LoadingOverlay />}
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
        <div className="absolute top-4 left-0 p-2 z-10 text-slate-700 diagram-ui-overlay">
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
          {/* Add class to SearchControl */}
          <SearchControl
            nodes={nodes}
            onNodeFound={onNodeFound}
            diagramRoots={diagramRoots}
            className="diagram-ui-overlay"
          />

          {/* Add class to HelpBox */}
          <HelpBox isEmpty={isEmpty} className="diagram-ui-overlay" />
          {/* Add class to ResetPositionsFab */}
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
            className="diagram-ui-overlay" // Pass class to its wrapper
          />

          {/* --- UPDATE YOUR ICON DOCK --- */}
          {/* Add class to IconDock and fab-button to all children */}
          <IconDock className="fab-dock diagram-ui-overlay">
            {rootId === null && (
              <SelectRootNodeFab
                onClick={() => setSelectRootModalOpen(true)}
                className="fab-button"
              />
            )}
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
      {/* --- ADD THE NEW DOWNLOAD BUTTON --- */}
      <DownloadImageFab
        onClick={onDownload}
        // Disable button if page is loading, diagram is empty, OR download is in progress
        disabled={loading || isEmpty}
        isDownloading={isDownloading}
        className="fab-button"
      />
      <Suspense fallback={<LoadingOverlay />}>
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
          nodes={nodes} // <-- ADD THIS
          getNodeIcon={getNodeIcon} // <-- ADD THIS
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
