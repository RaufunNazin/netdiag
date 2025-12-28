import { UI_ICONS } from "../../utils/icons";
import boxIcon from "../../assets/icons/box.png";

import apIcon from "../../assets/icons/ap.png";
import bambooIcon from "../../assets/icons/bamboo.png";
import mswitchIcon from "../../assets/icons/mswitch.png";
import uswitchIcon from "../../assets/icons/uswitch.png";
import oltIcon from "../../assets/icons/olt.png";
import onuIcon from "../../assets/icons/onu.png";
import ponIcon from "../../assets/icons/pon.png";
import routerIcon from "../../assets/icons/router.png";
import splitterIcon from "../../assets/icons/splitter.png";
import tjIcon from "../../assets/icons/tj.png";
import otherIcon from "../../assets/icons/other.png";

const ICONS_SRC = {
  ap: apIcon,
  bamboo: bambooIcon,
  mswitch: mswitchIcon,
  uswitch: uswitchIcon,
  olt: oltIcon,
  onu: onuIcon,
  pon: ponIcon,
  router: routerIcon,
  splitter: splitterIcon,
  tj: tjIcon,
  other: otherIcon,
  default: otherIcon,
};

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
      // Added dark:bg-slate-800/80, dark:border-slate-600
      className="p-3 m-2 rounded-md flex items-center space-x-2 
                 bg-white/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-600 cursor-move"
      onDragStart={(event) => onDragStart(event, nodeToDrag)}
      draggable
    >
      <img
        src={ICONS_SRC[node.data.icon] || ICONS_SRC.default}
        alt={node.data.node_type}
        width="20"
        height="20"
      />
      {/* Added dark:text-slate-200 */}
      <span className="text-sm font-semibold dark:text-slate-200">
        {node.data.label.length > 18
          ? `${node.data.label.slice(0, 18)}...`
          : node.data.label}
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
        // Added dark:bg-slate-900/95
        className={`fixed top-0 left-0 h-[calc(100%-16px)] w-64 m-2 ml-0 rounded-lg bg-white/80 dark:bg-slate-900/95 backdrop-blur-sm shadow-xl
                   z-40 transition-transform duration-300 ease-in-out
                   ${isOpen ? "transform-none ml-2" : "-translate-x-full"}`}
      >
        {/* Added dark:border-slate-700 */}
        <div className="flex justify-between items-center p-3 bg-transparent rounded-t-lg border-b border-slate-300 dark:border-slate-700">
          {/* Added dark:text-slate-200 */}
          <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">
            Inventory
          </h3>
          <button
            onClick={onClose}
            // Added dark:text-slate-400, dark:hover:text-slate-200
            className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            title="Close Inventory [ESC]"
          >
            {UI_ICONS.chevronLeft}
          </button>
        </div>
        <div className={`overflow-y-auto h-[calc(100%-60px)] p-1`}>
          {nodes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2">
              <img src={boxIcon} alt="Empty Inventory" className="w-10 h-10" />
              {/* Added dark:text-slate-400 */}
              <p className="text-center text-slate-500 dark:text-slate-400">
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
