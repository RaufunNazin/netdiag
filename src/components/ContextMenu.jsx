import { ACTIONS, LABELS, MISC } from "../utils/enums";

const ContextMenu = ({ id, top, left, onAction, node, edges, ...props }) => {
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

        const hasIncomingEdge = edges?.some((edge) => edge.target === id);

        const isOrphan =
          node?.data?.parent_id === null ||
          node?.data?.parent_id === 0 ||
          !hasIncomingEdge;

        if (isOrphan) {
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
      className="absolute z-50 bg-white dark:bg-neutral-900 rounded-md shadow-md border border-neutral-200 dark:border-neutral-800 text-sm"
    >
      <ul className="py-1">
        {menuItems.map(({ label, action }) => (
          <li
            key={action}
            onClick={() => onAction(action, { id, node })}
            className={`px-4 py-2 cursor-pointer transition-colors ${
              action === ACTIONS.DELETE_NODE || action === ACTIONS.DELETE_EDGE
                ? "hover:bg-[#d43c3c]/10 dark:hover:bg-[#d43c3c]/20 text-[#d43c3c]"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
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
