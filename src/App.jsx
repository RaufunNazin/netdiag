import React, { useState, useCallback, useMemo, useRef } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  useReactFlow,
  MarkerType,
  Handle,
  Position,
  reconnectEdge,
} from "reactflow";
import "reactflow/dist/style.css";

// --- Helper Functions ---

/**
 * Recursively finds all descendant nodes and edges for a given starting node.
 * @param {string} nodeId - The ID of the node to start from.
 * @param {Array} allNodes - The complete list of all nodes.
 * @param {Array} allEdges - The complete list of all edges.
 * @returns {{hiddenNodeIds: Set<string>, hiddenEdgeIds: Set<string>}} - Sets of IDs to hide.
 */
const getDescendants = (nodeId, allNodes, allEdges) => {
  const hiddenNodeIds = new Set();
  const hiddenEdgeIds = new Set();
  const queue = [nodeId];
  const visited = new Set([nodeId]);

  while (queue.length > 0) {
    const currentId = queue.shift();
    const outgoingEdges = allEdges.filter((edge) => edge.source === currentId);

    for (const edge of outgoingEdges) {
      hiddenEdgeIds.add(edge.id);
      const targetId = edge.target;
      if (!visited.has(targetId)) {
        visited.add(targetId);
        hiddenNodeIds.add(targetId);
        queue.push(targetId);
      }
    }
  }

  return { hiddenNodeIds, hiddenEdgeIds };
};

// --- Icon Components ---
const ICONS = {
  input: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  ),
  output: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  ),
  default: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="13" width="20" height="8" rx="2" ry="2"></rect>
      <line x1="6" y1="13" x2="6" y2="17"></line>
      <line x1="10" y1="13" x2="10" y2="17"></line>
      <line x1="14" y1="13" x2="14" y2="17"></line>
      <line x1="18" y1="13" x2="18" y2="17"></line>
      <path d="M12 4v5"></path>
      <path d="M10 9h4"></path>
      <path d="M12 9V2"></path>
      <path d="M10 2h4"></path>
      <path d="M12 2l4 2-8 0 4-2z"></path>
    </svg>
  ),
};

// --- UI Components ---

/**
 * Custom node component with dedicated input/output handles and an icon.
 */
const CustomNode = ({ data, isConnectable }) => {
  return (
    <div
      className={`p-3 rounded-lg shadow-md flex items-center space-x-3 text-gray-800 ${
        data.isCollapsed ? "bg-gray-300" : "bg-white"
      } border-2 ${
        data.isHighlighted ? "border-red-500 border-4" : "border-gray-400"
      } transition-all`}
    >
      {data.icon !== "input" && (
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          isConnectable={isConnectable}
          className="!bg-lime-500 !w-3 !h-3"
        />
      )}
      <div className="w-6 h-6">{ICONS[data.icon] || ICONS["default"]}</div>
      <div className="text-sm font-semibold">{data.label}</div>
      {data.icon !== "output" && (
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          isConnectable={isConnectable}
          className="!bg-orange-500 !w-3 !h-3"
        />
      )}
    </div>
  );
};

/**
 * A context menu that appears on right-click.
 */
const ContextMenu = ({ id, top, left, onAction, ...props }) => {
  const { type } = props;

  const getMenuItems = () => {
    switch (type) {
      case "node":
        return [
          { label: "Edit Device", action: "editNode" },
          { label: "Delete Device", action: "deleteNode" },
        ];
      case "edge":
        return [
          { label: "Rename Connection", action: "renameEdge" },
          { label: "Insert Device on Line", action: "insertNode" },
          { label: "Delete Connection", action: "deleteEdge" },
        ];
      default:
        return [{ label: "Add Device", action: "addNode" }];
    }
  };

  return (
    <div
      style={{ top, left }}
      className="absolute z-50 bg-white rounded-md shadow-lg border border-gray-200 text-sm"
    >
      <ul className="py-1">
        {getMenuItems().map(({ label, action }) => (
          <li
            key={action}
            onClick={() => onAction(action, { id })}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Modal dialog for editing the properties of a node.
 */
const EditNodeModal = ({ node, isOpen, onClose, onSave }) => {
  const [label, setLabel] = useState(node?.data?.label || "");
  React.useEffect(() => {
    setLabel(node?.data?.label || "");
  }, [node]);
  if (!isOpen || !node) return null;

  const handleSave = () => {
    onSave(node.id, label);
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Edit Device</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Device Name
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal dialog for adding a new device.
 */
const AddNodeModal = ({
  isOpen,
  onClose,
  onSave,
  defaultPosition,
  isInsertion,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("default");

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave(name, type, defaultPosition);
      onClose();
      setName("");
      setType("default");
    } else {
      // Using a less obtrusive way to show error.
      const input = document.querySelector("#add-node-name-input");
      if (input) input.style.borderColor = "red";
    }
  };

  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 space-y-4">
        <h3 className="text-xl font-bold text-gray-800">
          {isInsertion ? "Insert New Device" : "Add New Device"}
        </h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Device Name
          </label>
          <input
            id="add-node-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Switch-02"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Device Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="default">Default (Switch/TJ-Box)</option>
            <option value="input">Root (ISP Office)</option>
            <option value="output">Client (ONU)</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {isInsertion ? "Insert Device" : "Add Device"}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal dialog for confirming deletions.
 */
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, itemType }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 bg-black/50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 space-y-4">
        <h3 className="text-xl font-bold text-red-600">Confirm Deletion</h3>
        <p>
          Are you sure you want to delete this {itemType}? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * An expandable help box in the corner of the screen.
 */
const HelpBox = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <div
        className={`bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 w-72 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <h3 className="text-lg font-bold text-gray-800 mb-2">How to Use</h3>
        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
          <li>
            <b>Double-click</b> a device to expand or collapse its branch.
          </li>
          <li>
            <b>Right-click</b> on an item for more actions like editing or
            deleting.
          </li>
          <li>
            <b>Drag lines</b> from one connection point to another to reconnect
            them.
          </li>
          <li>
            Connections go from an <b>orange</b> point (right) to a <b>green</b>{" "}
            point (left).
          </li>
          <li>
            <b>Pan & Zoom</b> using your mouse or the controls in the top-left.
          </li>
        </ul>
      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mt-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-blue-600 transition-transform hover:scale-105"
      >
        {isOpen ? "Close Help" : "?"}
      </button>
    </div>
  );
};

/**
 * A search bar to find and focus on nodes.
 */
const SearchControl = ({ nodes, onNodeFound }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 1) {
      setResults(
        nodes.filter((n) =>
          n.data.label.toLowerCase().includes(val.toLowerCase())
        )
      );
    } else {
      setResults([]);
    }
  };

  const handleSelect = (nodeId) => {
    onNodeFound(nodeId);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="absolute top-4 right-4 z-10 bg-white/90 p-2 rounded-lg shadow-lg w-64">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search for a device..."
        className="w-full p-2 border border-gray-300 rounded-md"
      />
      {results.length > 0 && (
        <ul className="mt-1 border border-gray-200 rounded-md bg-white">
          {results.slice(0, 5).map((node) => (
            <li
              key={node.id}
              onClick={() => handleSelect(node.id)}
              className="p-2 hover:bg-gray-100 cursor-pointer border-b"
            >
              {node.data.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// --- Main Application Component ---

const nodeTypes = { custom: CustomNode };

const NetworkDiagram = () => {
  const reactFlowWrapper = useRef(null);
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeIdCounter, setNodeIdCounter] = useState(initialNodes.length + 1);
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

  // --- Reconnecting Edges Logic ---
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

  // --- Connection Validation ---
  const isValidConnection = useCallback((connection) => {
    if (connection.source === connection.target) return false;
    return (
      connection.sourceHandle === "right" && connection.targetHandle === "left"
    );
  }, []);

  // --- Context Menu Logic ---
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

  // --- Single-click to Expand/Collapse ---
  const onNodeClick = useCallback(
    (event, node) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? {
                ...n,
                data: {
                  ...n.data,
                  isCollapsed: !n.data?.isCollapsed, // toggle collapse state
                },
              }
            : n
        )
      );
    },
    [setNodes]
  );

  // --- Diagram Action Handlers ---
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
      // connection
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

  // --- Expand/Collapse Logic ---
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

  return (
    <div style={{ width: "100vw", height: "100vh" }} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
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
};

// --- Initial Data (Now with custom type and icon data) ---
const initialNodes = [
  {
    id: "node-1",
    type: "custom",
    data: { label: "ISP Office (Root)", icon: "input" },
    position: { x: 0, y: 150 },
  },
  {
    id: "node-2",
    type: "custom",
    data: { label: "OLT-01", icon: "default" },
    position: { x: 250, y: 150 },
  },
  {
    id: "node-3",
    type: "custom",
    data: { label: "Switch-A", icon: "default" },
    position: { x: 500, y: 50 },
  },
  {
    id: "node-4",
    type: "custom",
    data: { label: "TJ-Box-1", icon: "default" },
    position: { x: 500, y: 250 },
  },
  {
    id: "node-5",
    type: "custom",
    data: { label: "Client A's ONU", icon: "output" },
    position: { x: 750, y: 50 },
  },
  {
    id: "node-6",
    type: "custom",
    data: { label: "Client B's ONU", icon: "output" },
    position: { x: 750, y: 250 },
  },
  {
    id: "node-7",
    type: "custom",
    data: { label: "Backup Switch", icon: "default" },
    position: { x: 250, y: 0 },
  },
];

const initialEdges = [
  {
    id: "e1-2",
    source: "node-1",
    sourceHandle: "right",
    target: "node-2",
    targetHandle: "left",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e2-3",
    source: "node-2",
    sourceHandle: "right",
    target: "node-3",
    targetHandle: "left",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e2-4",
    source: "node-2",
    sourceHandle: "right",
    target: "node-4",
    targetHandle: "left",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e3-5",
    source: "node-3",
    sourceHandle: "right",
    target: "node-5",
    targetHandle: "left",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e4-6",
    source: "node-4",
    sourceHandle: "right",
    target: "node-6",
    targetHandle: "left",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e7-3",
    source: "node-7",
    sourceHandle: "right",
    target: "node-3",
    targetHandle: "left",
    label: "Backup Link",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];

// --- App Entry Point ---
export default function App() {
  return (
    <ReactFlowProvider>
      <NetworkDiagram />
    </ReactFlowProvider>
  );
}
