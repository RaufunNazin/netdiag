import { ACTIONS, LABELS, MISC } from "../utils/enums";

const ContextMenu = ({ id, top, left, onAction, node, ...props }) => {
  const { type } = props;

  const getMenuItems = () => {
    switch (type) {
      case MISC.NODE: {
        const nodeItems = [
          { label: LABELS.EDIT_DEVICE, action: ACTIONS.EDIT_NODE },
          { label: LABELS.RESET_POSITION, action: ACTIONS.RESET_POSITION },
          { label: "Highlight Path", action: "HIGHLIGHT_PATH" },
          { label: LABELS.DELETE_DEVICE, action: ACTIONS.DELETE_NODE },
        ];

        if (node?.data?.parent_id === null || node?.data?.parent_id === 0) {
          nodeItems.splice(3, 0, {
            label: LABELS.SEND_TO_INVENTORY,
            action: ACTIONS.SEND_TO_INVENTORY,
          });
        }

        return nodeItems;
      }
      case MISC.EDGE:
        return [
          { label: LABELS.VIEW_DETAILS, action: ACTIONS.EDIT_EDGE },
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
      className="absolute z-50 bg-white rounded-md shadow-md border border-slate-200 text-sm"
    >
      <ul className="py-1">
        {menuItems.map(({ label, action }) => (
          <li
            key={action}
            onClick={() => onAction(action, { id, node })}
            className={`px-4 py-2 cursor-pointer ${
              action === ACTIONS.DELETE_NODE || action === ACTIONS.DELETE_EDGE
                ? "hover:bg-[#d43c3c]/10 text-[#d43c3c]"
                : "hover:bg-slate-100 text-slate-700"
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
