import React, { useEffect, useState } from "react";
import { UI_ICONS } from "../../utils/icons";

const ShortcutRow = ({ keys, description }) => (
  // Added dark:border-slate-700
  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
    {/* Added dark:text-slate-300 */}
    <span className="text-sm text-slate-600 dark:text-slate-300">
      {description}
    </span>
    <div className="flex gap-1">
      {keys.map((k, i) => (
        <kbd
          key={i}
          // Added dark:bg-slate-700, dark:border-slate-600, dark:text-slate-200
          className="min-w-[20px] text-center px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-200"
        >
          {k}
        </kbd>
      ))}
    </div>
  </div>
);

const HelpBox = ({ isEmpty }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("shortcuts");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
        return;
      }

      if (e.key.toLowerCase() === "h") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      if (isOpen) {
        if (e.key === "Escape") {
          e.preventDefault();
          setIsOpen(false);
        }
        if (e.key === "Tab") {
          e.preventDefault();
          setActiveTab((prev) => (prev === "guide" ? "shortcuts" : "guide"));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Common class for info buttons in dark mode
  const infoBtnClass =
    "p-0.5 text-slate-400 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600";

  const guideContent = isEmpty
    ? [
        <span key="empty1">
          Your network is empty. The <b>plus icon</b> below adds your first
          device.
        </span>,
        <span key="empty2">
          Options like Edit Mode become available after adding a device.
        </span>,
      ]
    : [
        <span key="search">
          The <b>Search bar</b> (top right) locates any device.
        </span>,

        <span key="root" className="flex items-center gap-2">
          <button className="h-6 w-6 rounded-full bg-blue-500 p-1 text-white  flex items-center justify-center">
            {UI_ICONS.root}
          </button>{" "}
          Selects a new <b>root device</b> for the view.
        </span>,

        <span key="add" className="flex items-center gap-2">
          <button className="h-6 w-6 rounded-full bg-green-500 p-1 text-white  flex items-center justify-center">
            {UI_ICONS.add}
          </button>{" "}
          <b>Adds</b> a new device to the diagram.
        </span>,

        <span key="edit" className="flex items-center gap-2">
          <button className="h-6 w-6 rounded-full bg-orange-400 p-1.5 text-white  flex items-center justify-center">
            {React.cloneElement(UI_ICONS.edit, { className: "w-3 h-3" })}
          </button>{" "}
          Enters <b>Edit Mode</b> (Move, Connect, Delete).
        </span>,

        <span key="undo" className="flex items-center gap-2">
          <button className="h-6 w-6 rounded-full bg-[#ef4444] p-1 text-white  flex items-center justify-center">
            {UI_ICONS.undo}
          </button>{" "}
          <b>Undoes</b> the last action.
        </span>,

        <span key="fit" className="flex items-center gap-2">
          <button className="h-6 w-6 rounded-full bg-blue-500 p-1 text-white  flex items-center justify-center">
            {UI_ICONS.expand}
          </button>{" "}
          <b>Centers</b> the view on screen.
        </span>,

        <span key="reset" className="flex items-center gap-2">
          <button className="h-6 w-6 rounded-full bg-[#ef4444] p-1 text-white  flex items-center justify-center rotate-90">
            {UI_ICONS.reset}
          </button>{" "}
          <b>Resets</b> node layout positions.
        </span>,

        <span key="export" className="flex items-center gap-2">
          <button className="h-6 w-6 rounded-full bg-blue-500 p-1 text-white  flex items-center justify-center">
            {UI_ICONS.download}
          </button>{" "}
          <b>Exports</b> the diagram as a PNG.
        </span>,

        <span key="labels" className="flex items-center gap-2">
          <button className="h-6 w-6 rounded-full bg-blue-500 p-1 text-white  flex items-center justify-center">
            {UI_ICONS.tag}
          </button>{" "}
          <b>Toggles</b> cable descriptions.
        </span>,

        <span key="trace" className="flex items-center gap-2">
          <button className="h-6 w-6 rounded-full bg-blue-500 p-1 text-white  flex items-center justify-center">
            {UI_ICONS.route}
          </button>{" "}
          <b>Traces</b> the path between two devices.
        </span>,

        <span key="inventory" className="flex items-center gap-2">
          <button className="h-6 w-6 rounded-r-sm bg-blue-500 p-1 text-white  flex items-center justify-center">
            {UI_ICONS.chevronRight_main}
          </button>{" "}
          Accesses the <b>Inventory</b> drawer.
        </span>,

        <span key="connection" className="flex items-center gap-1">
          Connects from{" "}
          <span className="inline-block w-2.5 h-2.5 bg-orange-500 rounded-full mx-1" />
          ⟶{" "}
          <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full mx-1" />
          .
        </span>,

        <span key="collapse">
          Clicking any device <b>Expands</b> or <b>Collapses</b> its children.
        </span>,

        <span key="onu_info" className="flex items-center gap-2">
          Hovering on <button className={infoBtnClass}>{UI_ICONS.info}</button>{" "}
          (ONU) shows <b>customer details</b>.
        </span>,

        <span key="dev_info" className="flex items-center gap-2">
          Clicking on <button className={infoBtnClass}>{UI_ICONS.info}</button>{" "}
          shows <b>device details</b>.
        </span>,

        <span key="olt_nav" className="flex items-center gap-2">
          Clicking{" "}
          <button className={infoBtnClass}>{UI_ICONS.chevronRight}</button>{" "}
          (OLT) opens the <b>OLT view</b>.
        </span>,
      ];

  return (
    <div className="absolute bottom-4 right-2 md:right-4 z-10">
      <div
        // Added dark:border-slate-700 and dark:bg-slate-800/95
        className={`w-80 md:w-96 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 p-0 shadow-xl backdrop-blur-sm z-20 overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none hidden"
        }`}
      >
        {/* Added dark:border-slate-700 and dark:bg-slate-900 */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <button
            onClick={() => setActiveTab("guide")}
            // Updated active/inactive states for dark mode
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              activeTab === "guide"
                ? "text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 border-b-2 border-blue-500"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            Visual Guide
          </button>
          <button
            onClick={() => setActiveTab("shortcuts")}
            // Updated active/inactive states for dark mode
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              activeTab === "shortcuts"
                ? "text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 border-b-2 border-blue-500"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            Keyboard Shortcuts
          </button>
        </div>
        <div className="p-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {activeTab === "guide" ? (
            // Added dark:text-slate-300
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {guideContent.map((point, index) => (
                <li key={index} className="flex items-start leading-snug">
                  {/* Added dark:bg-slate-500 */}
                  <span className="mr-2 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-4">
              <div>
                {/* Added dark:text-slate-500 */}
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-2">
                  Global
                </h4>
                <ShortcutRow
                  keys={["Ctrl", "F"]}
                  description="Search Devices"
                />
                <ShortcutRow
                  keys={["Esc"]}
                  description="Close Modals / Clear"
                />
                <ShortcutRow keys={["0"]} description="Fit View to Screen" />
                <ShortcutRow
                  keys={["Ctrl", "Shift", "S"]}
                  description="Export Diagram"
                />
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-2">
                  Editing
                </h4>
                <ShortcutRow keys={["E"]} description="Toggle Edit Mode" />
                <ShortcutRow keys={["N"]} description="Add New Node" />
                <ShortcutRow keys={["Ctrl", "S"]} description="Save Changes" />
                <ShortcutRow
                  keys={["Ctrl", "Z"]}
                  description="Undo Last Action"
                />
                <ShortcutRow
                  keys={["Del"]}
                  description="Delete Selected Item (Only in Edit Mode)"
                />
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-2">
                  Tools
                </h4>
                <ShortcutRow keys={["T"]} description="Trace Route" />
                <ShortcutRow keys={["I"]} description="Toggle Inventory" />
                <ShortcutRow keys={["B"]} description="Toggle Bottom Dock" />
                <ShortcutRow keys={["V"]} description="Toggle Vertical Dock" />
                <ShortcutRow keys={["L"]} description="Toggle Cable Labels" />
                <ShortcutRow keys={["R"]} description="Reset Node Positions" />
              </div>
            </div>
          )}
        </div>

        {/* Added dark:bg-slate-900, dark:border-slate-700, dark:text-slate-500 */}
        <div className="p-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 dark:text-slate-500 text-center">
          Built using{" "}
          <a
            href="https://github.com/xyflow/xyflow"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-500 dark:hover:text-slate-400"
          >
            xyflow
          </a>{" "}
          © webkid GmbH (MIT License)
        </div>
      </div>

      <div className="flex justify-end mt-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          // Added dark:text-blue-400, dark:bg-slate-700/800, dark:border-slate-600/700
          className={`p-2 rounded-full text-blue-500 dark:text-blue-400 transition-all duration-300 ${
            isOpen
              ? "bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rotate-180"
              : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rotate-0"
          }`}
          title={isOpen ? "Close Help [H/ESC]" : "Open Help [H]"}
        >
          {isOpen ? UI_ICONS.cross : UI_ICONS.question}
        </button>
      </div>
    </div>
  );
};

export default HelpBox;
