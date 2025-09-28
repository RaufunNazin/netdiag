import React from "react";
import { Handle, Position } from "reactflow";

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
      {" "}
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>{" "}
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
      {" "}
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>{" "}
      <polyline points="9 22 9 12 15 12 15 22"></polyline>{" "}
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
      {" "}
      <rect x="2" y="13" width="20" height="8" rx="2" ry="2"></rect>{" "}
      <line x1="6" y1="13" x2="6" y2="17"></line>{" "}
      <line x1="10" y1="13" x2="10" y2="17"></line>{" "}
      <line x1="14" y1="13" x2="14" y2="17"></line>{" "}
      <line x1="18" y1="13" x2="18" y2="17"></line> <path d="M12 4v5"></path>{" "}
      <path d="M10 9h4"></path> <path d="M12 9V2"></path>{" "}
      <path d="M10 2h4"></path> <path d="M12 2l4 2-8 0 4-2z"></path>{" "}
    </svg>
  ),
};

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

export default CustomNode;
