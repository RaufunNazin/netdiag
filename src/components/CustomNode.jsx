import React from "react";
import { Handle, Position } from "reactflow";

// --- New, expanded icon set ---
const ICONS = {
  // OLT
  olt: <img src="/olt.png" alt="OLT" width="24" height="24" />,
  // PON Port
  pon: <img src="/pon.png" alt="PON Port" width="24" height="24" />,
  // Splitter
  splitter: <img src="/splitter.png" alt="Splitter" width="24" height="24" />,
  // TJ (Transition Joint)
  tj: <img src="/tj.png" alt="Transition Joint" width="24" height="24" />,
  // Unmanaged Switch
  uswitch: (
    <img src="/uswitch.png" alt="Unmanaged Switch" width="24" height="24" />
  ),
  // Managed Switch
  mswitch: (
    <img src="/mswitch.png" alt="Managed Switch" width="24" height="24" />
  ),
  // ONU
  onu: <img src="/onu.png" alt="ONU" width="24" height="24" />,
  // Fallback
  default: <img src="/default.png" alt="Default" width="24" height="24" />,
};

const CustomNode = ({ data, isConnectable }) => {
  // --- Logic for the status border ---
  let statusBorderClass = "";
  // Apply border only to ONU nodes
  if (data.node_type === "ONU") {
    if (data.status === 1) {
      // Status: 1 = UP
      statusBorderClass =
        "border-r-4 border-t-4 border-r-green-500 border-t-green-500";
    } else if (data.status === 2) {
      // Status: 2 = DOWN
      statusBorderClass =
        "border-r-4 border-t-4 border-r-red-500 border-t-red-500";
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
