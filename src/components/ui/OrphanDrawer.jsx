import { UI_ICONS } from "../../utils/icons";

const DrawerNode = ({ node }) => {
  const onDragStart = (event, nodeData) => {
    const dataString = JSON.stringify(nodeData);
    event.dataTransfer.setData("application/reactflow", dataString);
    event.dataTransfer.effectAllowed = "move";
  };

  const nodeToDrag = {
    id: node.id,
    type: node.type,
    data: node.data,
  };

  return (
    <div
      className="p-3 m-2 rounded-md flex items-center space-x-2 
                 bg-white/70 border border-gray-300 cursor-move"
      onDragStart={(event) => onDragStart(event, nodeToDrag)}
      draggable
    >
      <img
        src={`/${node.data.icon}.png`}
        alt={node.data.node_type}
        width="20"
        height="20"
      />
      <span className="text-sm font-semibold">
        {node.data.label.length > 18 ? `${node.data.label.slice(0, 18)}...` : node.data.label}
      </span>
    </div>
  );
};

const OrphanDrawer = ({ isOpen, onClose, nodes }) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-30 transition-opacity
                   ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 left-0 h-[calc(100%-16px)] w-64 m-2 ml-0 rounded-lg bg-white/80 shadow-xl
                   z-40 transition-transform duration-300 ease-in-out
                   ${isOpen ? "transform-none ml-2" : "-translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-3 bg-transparent rounded-t-lg border-b border-gray-300">
          <h3 className="font-bold text-lg text-gray-700">Inventory</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-800"
            title="Close Inventory"
          >
            {UI_ICONS.chevronLeft}
          </button>
        </div>
        <div
          className={`overflow-y-auto h-[calc(100%-60px)] p-1`}
        >
          {nodes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2">
              <img src="/box.png" alt="Empty Inventory" className="w-10 h-10" />
              <p className="text-center text-gray-500">
                Your inventory is empty.
              </p>
            </div>
          ) : (
            nodes.map((node) => <DrawerNode key={node.id} node={node} />)
          )}
        </div>
      </div>
    </>
  );
};

export default OrphanDrawer;
