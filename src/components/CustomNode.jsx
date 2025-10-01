import React from "react";
import { Handle, Position } from "reactflow";

// --- New, expanded icon set ---
const ICONS = {
  // OLT Icon
  olt: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
      <line x1="6" y1="6" x2="6.01" y2="6"></line>
      <line x1="10" y1="6" x2="10.01" y2="6"></line>
      <line x1="6" y1="18" x2="6.01" y2="18"></line>
      <line x1="10" y1="18" x2="10.01" y2="18"></line>
    </svg>
  ),
  // PON Port Icon
  pon: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h.01"></path>
      <path d="M8.5 20a4 4 0 0 1 7 0"></path>
      <path d="M5 20a8 8 0 0 1 14 0"></path>
      <path d="M12 4v12"></path>
    </svg>
  ),
  // Splitter Icon
  splitter: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 3h5v5"></path>
      <path d="M8 3H3v5"></path>
      <path d="M12 22V11"></path>
      <path d="m21 8-9 9-9-9"></path>
    </svg>
  ),
  // TJ (Transition Joint) Icon
  tj: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"></path>
      <path d="M18 9h2a2 2 0 0 1 2 2v9l-4-4h-2a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"></path>
    </svg>
  ),
  // Unmanaged/Managed Switch Icon
  uswitch: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="8" x="2" y="14" rx="2"></rect>
      <path d="M6 18h.01"></path>
      <path d="M10 18h.01"></path>
      <path d="M14 18h.01"></path>
      <path d="M18 18h.01"></path>
      <path d="M12 2v8"></path>
      <path d="m9 7 3-3 3 3"></path>
    </svg>
  ),
  // Same icon for switches, can be changed if needed
  mswitch: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="8" x="2" y="14" rx="2"></rect>
      <path d="M6 18h.01"></path>
      <path d="M10 18h.01"></path>
      <path d="M14 18h.01"></path>
      <path d="M18 18h.01"></path>
      <path d="M12 2v8"></path>
      <path d="m9 7 3-3 3 3"></path>
    </svg>
  ),
  // ONU Icon
  onu: (
    <svg
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
  // Fallback Icon
  default: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    </svg>
  ),
};

const CustomNode = ({ data, isConnectable }) => {
  // --- Logic for the status border ---
  let statusBorderClass = "";
  // Apply border only to ONU nodes
  if (data.node_type === "ONU") {
    if (data.status === 1) {
      // Status: 1 = UP
      statusBorderClass = "border-r-4 border-t-4 border-r-green-500 border-t-green-500";
    } else if (data.status === 2) {
      // Status: 2 = DOWN
      statusBorderClass = "border-r-4 border-t-4 border-r-red-500 border-t-red-500";
    }
  }

  return (
    <div
      className={`p-3 rounded-lg shadow-md flex items-center space-x-3 text-gray-800 ${
        data.isCollapsed ? "bg-gray-300" : "bg-white"
      } border-2 ${
        data.isHighlighted ? "border-red-500" : "border-gray-400"
      } ${statusBorderClass} transition-all`} // Apply status border class
    >
      {/* Target (input) handle is visible for all nodes except OLT */}
      {data.node_type !== "OLT" && (
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          isConnectable={isConnectable}
          className="!bg-blue-500 !w-3 !h-3"
        />
      )}

      <div className="w-6 h-6">{ICONS[data.icon] || ICONS["default"]}</div>

      <div className="text-sm font-semibold">{data.label}</div>

      {/* Source (output) handle is visible for all nodes except ONU */}
      {data.node_type !== "ONU" && (
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
