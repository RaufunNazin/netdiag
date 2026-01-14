import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  useNodesState,
  ReactFlow,
  useEdgesState,
  Background,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  Panel,
  Controls,
  getNodesBounds,
} from "@xyflow/react";
import dagre from "dagre";
import { toPng } from "html-to-image";
import { toast } from "react-toastify";
import "@xyflow/react/dist/style.css";

import CustomNode from "../CustomNode";
import { tracePath } from "../../utils/graphUtils";
import { UI_ICONS } from "../../utils/icons";
import AsyncDeviceSelect from "../ui/AsyncDeviceSelect";

const NODE_WIDTH = 250;
const NODE_HEIGHT = 80;

const EDGE_COLOR_LIGHT = "#1e293b";
const EDGE_COLOR_DARK = "#94a3b8";

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

const TraceDiagramContent = ({
  initialNodes,
  initialEdges,
  sourceName,
  targetName,
  mode,
}) => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  const isDarkMode = document.documentElement.classList.contains("dark");

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setTimeout(() => fitView({ padding: 0.2 }), 50);
  }, [initialNodes, initialEdges, fitView, setNodes, setEdges]);

  const onDownload = useCallback(() => {
    if (!reactFlowWrapper.current || nodes.length === 0) return;

    const elementToCapture = reactFlowWrapper.current.querySelector(
      ".react-flow__viewport"
    );

    if (!elementToCapture) {
      toast.error("Diagram viewport not found.");
      return;
    }

    const nodesBounds = getNodesBounds(nodes);
    const padding = 50;
    const scaleFactor = 2;

    const imageWidth = (nodesBounds.width + padding * 2) * scaleFactor;
    const imageHeight = (nodesBounds.height + padding * 2) * scaleFactor;
    const translateX = -nodesBounds.x + padding;
    const translateY = -nodesBounds.y + padding;

    const isDark = document.documentElement.classList.contains("dark");
    const bgColor = isDark ? "#171717" : "#ffffff";

    toPng(elementToCapture, {
      backgroundColor: bgColor,
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `scale(${scaleFactor}) translate(${translateX}px, ${translateY}px)`,
      },
    }).then((dataUrl) => {
      const sanitize = (name) =>
        (name || "unknown").replace(/[^a-z0-9]/gi, "_").toLowerCase();

      const sName = sanitize(sourceName);
      const tName = sanitize(targetName);
      const modeStr = mode === "neighbor" ? "neighbor" : "direct";

      const pad = (num) => String(num).padStart(2, "0");
      const now = new Date();
      const timeString = `${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(
        now.getSeconds()
      )}-${now.getFullYear()}_${pad(now.getMonth() + 1)}_${pad(now.getDate())}`;

      const filename = `trace_${sName}_to_${tName}_${modeStr}-${timeString}.png`;

      const a = document.createElement("a");
      a.download = filename;
      a.href = dataUrl;
      a.click();
    });
  }, [sourceName, targetName, mode, nodes]);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  return (
    <div
      className="w-full h-full relative bg-neutral-50 dark:bg-neutral-950 transition-colors"
      ref={reactFlowWrapper}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={true}
        proOptions={{ hideAttribution: true }}
        colorMode={isDarkMode ? "dark" : "light"}
      >
        <Background variant="dots" gap={12} size={1} />
        <Controls />
        <Panel position="top-right">
          <button
            onClick={onDownload}
            className="download-btn bg-blue-600 dark:bg-blue-700 text-white px-3 py-1.5 rounded-md shadow-md hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 text-sm transition-colors"
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

  useEffect(() => {
    if (!isOpen) {
      setSource(null);
      setTarget(null);
      setTraceData(null);
    }
  }, [isOpen]);

  const handleTrace = useCallback(async () => {
    if (!source || !target) {
      toast.error("Please select both Source and Target devices.");
      return;
    }
    setIsLoading(true);
    setTraceData(null);

    const isDarkMode = document.documentElement.classList.contains("dark");
    const defaultEdgeColor = isDarkMode ? EDGE_COLOR_DARK : EDGE_COLOR_LIGHT;

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
          isTraceMode: true,
        },
        position: { x: 0, y: 0 },
      }));

      const rawEdges = data.edges.map((edge) => {
        let strokeColor = edge.cable_color || defaultEdgeColor;
        if (isDarkMode && strokeColor === "#1e293b") {
          strokeColor = EDGE_COLOR_DARK;
        }

        return {
          id: `e-${edge.id}`,
          source: String(edge.source_id),
          target: String(edge.target_id),
          label: edge.cable_desc,
          style: { stroke: strokeColor, strokeWidth: 3 },
          markerEnd: { type: MarkerType.ArrowClosed },
        };
      });

      const layouted = getLayoutedElements(rawNodes, rawEdges);
      setTraceData(layouted);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [source, target, mode, getNodeIcon]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen && e.key === "Enter") {
        e.preventDefault();
        if (source && target && !isLoading) {
          handleTrace();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, source, target, isLoading, handleTrace]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-900/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-6xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200 dark:border-neutral-800 transition-colors">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col gap-4 z-50 shadow-sm transition-colors">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-neutral-700 dark:text-neutral-50 flex items-center gap-2">
              Trace Network Path
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-neutral-600 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
            >
              {UI_ICONS.cross}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="w-full sm:w-64">
                <AsyncDeviceSelect
                  label="Source"
                  placeholder="Search Source Device..."
                  onSelect={setSource}
                  selectedItem={source}
                />
              </div>
              <span className="text-neutral-300 dark:text-neutral-500 hidden sm:block">
                →
              </span>
              <div className="w-full sm:w-64">
                <AsyncDeviceSelect
                  label="Target"
                  placeholder="Search Target Device..."
                  onSelect={setTarget}
                  selectedItem={target}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                <button
                  onClick={() => setMode("direct")}
                  className={`px-3 py-2 text-xs font-medium rounded-md transition-all ${
                    mode === "direct"
                      ? "bg-white dark:bg-neutral-600 text-neutral-800 dark:text-white shadow-sm"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  }`}
                >
                  Direct Path
                </button>
                <button
                  onClick={() => setMode("neighbor")}
                  className={`px-3 py-2 text-xs font-medium rounded-md transition-all ${
                    mode === "neighbor"
                      ? "bg-white dark:bg-neutral-600 text-neutral-800 dark:text-white shadow-sm"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  }`}
                >
                  With Neighbors
                </button>
              </div>

              <button
                onClick={handleTrace}
                disabled={isLoading || !source || !target}
                className="btn-primary shadow-none py-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLoading ? "Tracing..." : "Show Route"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-grow bg-neutral-50 dark:bg-neutral-950 relative overflow-hidden transition-colors">
          {traceData ? (
            <ReactFlowProvider>
              <TraceDiagramContent
                initialNodes={traceData.nodes}
                initialEdges={traceData.edges}
                sourceName={source?.name}
                targetName={target?.name}
                mode={mode}
              />
            </ReactFlowProvider>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 bg-neutral-50/50 dark:bg-neutral-950/50">
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
