import {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Background,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  Panel,
  Controls,
} from "reactflow";
import dagre from "dagre";
import { toPng } from "html-to-image";
import { toast } from "react-toastify";
import "reactflow/dist/style.css";

import CustomNode from "../CustomNode";
import { tracePath } from "../../utils/graphUtils";
import { UI_ICONS } from "../../utils/icons";
import AsyncDeviceSelect from "../ui/AsyncDeviceSelect"; // IMPORT NEW COMPONENT

const NODE_WIDTH = 250;
const NODE_HEIGHT = 80;

const getLayoutedElements = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setGraph({ rankdir: "LR" });

  dagreGraph.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
      targetPosition: "left",
      sourcePosition: "right",
    };
  });

  return { nodes: layoutedNodes, edges };
};

const TraceDiagramContent = ({ initialNodes, initialEdges }) => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setTimeout(() => fitView({ padding: 0.2 }), 50);
  }, [initialNodes, initialEdges, fitView, setNodes, setEdges]);

  // --- UPDATED DOWNLOAD LOGIC ---
  const onDownload = useCallback(() => {
    if (!reactFlowWrapper.current) return;

    toPng(reactFlowWrapper.current, {
      backgroundColor: "#fff",
      filter: (node) => {
        // Filter out elements we don't want in the screenshot
        const classList = node.classList;
        if (!classList) return true;

        return (
          !classList.contains("react-flow__controls") && // Hide Zoom/Fit controls
          !classList.contains("react-flow__panel") && // Hide the Panel container
          !classList.contains("download-btn") // Hide the button itself
        );
      },
    }).then((dataUrl) => {
      const a = document.createElement("a");
      a.download = `trace-path-${Date.now()}.png`;
      a.href = dataUrl;
      a.click();
    });
  }, []);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  return (
    <div className="w-full h-full relative bg-slate-50" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={true}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant="dots" gap={12} size={1} />
        <Controls /> {/* This will be filtered out by the class name */}
        <Panel position="top-right">
          <button
            onClick={onDownload}
            // Added 'download-btn' class for filtering
            className="download-btn bg-blue-600 text-white px-3 py-1.5 rounded-md shadow-md hover:bg-blue-700 flex items-center gap-2 text-sm"
          >
            {UI_ICONS.download} Download PNG
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

const TracePathModal = ({ isOpen, onClose, getNodeIcon }) => {
  const [source, setSource] = useState(null);
  const [target, setTarget] = useState(null);
  const [mode, setMode] = useState("direct");
  const [traceData, setTraceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSource(null);
      setTarget(null);
      setTraceData(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTrace = async () => {
    if (!source || !target) {
      toast.error("Please select both Source and Target devices.");
      return;
    }
    setIsLoading(true);
    setTraceData(null);

    try {
      const data = await tracePath(source.id, target.id, mode === "neighbor");

      if (data.devices.length === 0) {
        toast.warning("No path found between these devices.");
        setIsLoading(false);
        return;
      }

      const rawNodes = data.devices.map((dev) => ({
        id: String(dev.id),
        type: "custom",
        data: {
          ...dev,
          label: dev.name,
          icon: getNodeIcon(dev.node_type),
          onDetailsClick: undefined,
          onNavigateClick: undefined,
          isTraceMode: true, // Optional: Use this in CustomNode to hide edit handles
        },
        position: { x: 0, y: 0 },
      }));

      const rawEdges = data.edges.map((edge) => ({
        id: `e-${edge.id}`,
        source: String(edge.source_id),
        target: String(edge.target_id),
        label: edge.cable_desc,
        style: { stroke: edge.cable_color || "#1e293b", strokeWidth: 3 },
        markerEnd: { type: MarkerType.ArrowClosed },
      }));

      const layouted = getLayoutedElements(rawNodes, rawEdges);
      setTraceData(layouted);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col gap-4 z-50 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              {UI_ICONS.route} Trace Network Path
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              {UI_ICONS.cross}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center">
            {/* Selectors */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="w-full sm:w-64">
                <AsyncDeviceSelect
                  label="Source"
                  placeholder="Search Source Device..."
                  onSelect={setSource}
                  selectedItem={source}
                />
              </div>
              <span className="text-slate-300 hidden sm:block">→</span>
              <div className="w-full sm:w-64">
                <AsyncDeviceSelect
                  label="Target"
                  placeholder="Search Target Device..."
                  onSelect={setTarget}
                  selectedItem={target}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setMode("direct")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    mode === "direct"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Direct Path
                </button>
                <button
                  onClick={() => setMode("neighbor")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    mode === "neighbor"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  With Neighbors
                </button>
              </div>

              <button
                onClick={handleTrace}
                disabled={isLoading || !source || !target}
                className="btn-primary py-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLoading ? "Tracing..." : "Show Route"}
              </button>
            </div>
          </div>
        </div>

        {/* Diagram Area */}
        <div className="flex-grow bg-slate-50 relative overflow-hidden">
          {traceData ? (
            <ReactFlowProvider>
              <TraceDiagramContent
                initialNodes={traceData.nodes}
                initialEdges={traceData.edges}
              />
            </ReactFlowProvider>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
              <div className="scale-[2] mb-4 opacity-20">{UI_ICONS.route}</div>
              <p className="font-medium">
                Select a Source and Target to visualize the connection.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TracePathModal;
