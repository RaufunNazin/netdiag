import React from "react";

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

export default ContextMenu;
