import { ACTIONS, LABELS, MISC } from "../utils/enums";

// --- MODIFIED: Accept full `node` prop ---
const ContextMenu = ({ id, top, left, onAction, node, ...props }) => {
  const { type } = props;

  const getMenuItems = () => {
    switch (type) {
      case MISC.NODE: {
        const nodeItems = [
          { label: LABELS.EDIT_DEVICE, action: ACTIONS.EDIT_NODE },
          { label: LABELS.RESET_POSITION, action: ACTIONS.RESET_POSITION },
          { label: LABELS.DELETE_DEVICE, action: ACTIONS.DELETE_NODE },
        ];
        // --- ADD THIS CONDITION ---
        // Only show if the node has no parent (orphan or root on canvas)
        if (node?.data?.parent_id === null || node?.data?.parent_id === 0) {
          nodeItems.push({
            label: LABELS.SEND_TO_INVENTORY,
            action: ACTIONS.SEND_TO_INVENTORY,
          });
        }
        // --- END CONDITION ---
        return nodeItems;
      }
      case MISC.EDGE:
        return [
          { label: LABELS.INSERT_DEVICE_ON_LINE, action: ACTIONS.INSERT_NODE },
          { label: LABELS.DELETE_CONNECTION, action: ACTIONS.DELETE_EDGE },
        ];
      default:
        return [];
    }
  };
  const menuItems = getMenuItems();
  if (menuItems.length === 0) return null;
  return (
    <div
      style={{ top, left }}
      className="absolute z-50 bg-white rounded-md shadow-lg border border-gray-200 text-sm"
    >
      <ul className="py-1">
        {menuItems.map(({ label, action }) => (
          <li
            key={action}
            // --- MODIFIED: Pass the full node back if needed by the action ---
            onClick={() => onAction(action, { id, node })}
            className={`px-4 py-2 cursor-pointer ${
              action === ACTIONS.DELETE_NODE || action === ACTIONS.DELETE_EDGE
                ? "hover:bg-[#d43c3c]/10 text-[#d43c3c]" // Keep delete red
                : action === ACTIONS.SEND_TO_INVENTORY
                ? "hover:bg-orange-500/10 text-orange-600" // Style for inventory action
                : "hover:bg-gray-100 text-gray-700" // Default style
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
