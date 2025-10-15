import React from "react";

const ContextMenu = ({ id, top, left, onAction, ...props }) => {
  const { type } = props;

  const getMenuItems = () => {
    switch (type) {
      case "node":
        return [
          { label: "Edit Device", action: "editNode" },
          { label: "Reset Position", action: "resetPosition" },
          { label: "Delete Device", action: "deleteNode" },
        ];
      case "edge":
        return [
          { label: "Insert Device on Line", action: "insertNode" },
          { label: "Delete Connection", action: "deleteEdge" },
        ];
      default:
        return [];
    }
  };
  const menuItems = getMenuItems();
  if (menuItems.length === 0) return null; // Don't render if there are no items
  return (
    <div
      style={{ top, left }}
      className="absolute z-50 bg-white rounded-md shadow-lg border border-gray-200 text-sm"
    >
      <ul className="py-1">
        {menuItems.map(({ label, action }) => (
          <li
            key={action}
            onClick={() => onAction(action, { id })}
            className={`px-4 py-2 cursor-pointer ${
              action === "deleteNode" || action === "deleteEdge"
                ? "hover:bg-[#d43c3c]/10 text-[#d43c3c]"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContextMenu;
