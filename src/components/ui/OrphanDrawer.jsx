import { UI_ICONS } from "../../utils/icons"; // Assuming your icons are here

/**
 * A simple draggable node for the inventory drawer.
 * This is NOT a React Flow node, just a regular div.
 */
const DrawerNode = ({ node }) => {
  const onDragStart = (event, nodeData) => {
    // We store the node's data in the drag event
    const dataString = JSON.stringify(nodeData);
    event.dataTransfer.setData("application/reactflow", dataString);
    event.dataTransfer.effectAllowed = "move";
  };

  // We need to pass the full node object, including its data,
  // so we can re-create it on the canvas.
  const nodeToDrag = {
    id: node.id,
    type: node.type,
    data: node.data,
    // We don't pass position, as it will be set on drop
  };

  return (
    <div
      className="p-2 m-2 rounded-md shadow-md flex items-center space-x-2 
                 bg-white border border-gray-300 cursor-move"
      onDragStart={(event) => onDragStart(event, nodeToDrag)}
      draggable
    >
      <img
        src={`/${node.data.icon}.png`}
        alt={node.data.node_type}
        width="20"
        height="20"
      />
      <span className="text-sm font-semibold">{node.data.label}</span>
    </div>
  );
};

/**
 * The Drawer component that slides in and out
 */
const OrphanDrawer = ({ isOpen, onClose, nodes }) => {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-30 transition-opacity
                   ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-100 shadow-xl 
                   z-40 transition-transform duration-300 ease-in-out
                   ${isOpen ? "transform-none" : "-translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-3 border-b bg-white">
          <h3 className="font-bold text-lg text-gray-700">Inventory</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-800"
          >
            {UI_ICONS.chevronLeft}
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-60px)] p-2">
          {nodes.length === 0 ? (
            <p className="text-center text-gray-500 p-4">No orphan nodes.</p>
          ) : (
            nodes.map((node) => <DrawerNode key={node.id} node={node} />)
          )}
        </div>
      </div>
    </>
  );
};

export default OrphanDrawer;
