import dagre from "dagre";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250; // Adjust to fit your node content
const nodeHeight = 60; // Adjust as needed

export const getLayoutedElements = (nodes, edges) => {
  dagreGraph.setGraph({
    rankdir: "LR",
    ranksep: 10, // Controls vertical spacing between PON groups
    nodesep: 5, // Controls spacing between nodes in the same column (e.g., OLT and another device)
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    return node;
  });

  return { nodes: layoutedNodes, edges };
};
