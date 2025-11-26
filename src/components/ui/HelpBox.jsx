import React, { useState } from "react";
import { UI_ICONS } from "../../utils/icons";

const HelpBox = ({ isEmpty }) => {
  const [isOpen, setIsOpen] = useState(false);

  const helpContent = isEmpty
    ? {
        title: "Getting Started",
        points: [
          <>
            Your network is empty. The <b>plus icon</b> below adds your first
            device.
          </>,
          "Options like Edit Mode become available after adding a device.",
        ],
      }
    : {
        title: "How to Use",
        points: [
          <>
            The <b>Search bar</b> (top right) locates any device.
          </>,

          <>
            {
              <button className="z-10 rounded-full bg-blue-500 p-1 text-white transition-all duration-200 hover:bg-blue-600">
                {UI_ICONS.root}
              </button>
            }{" "}
            Selects a new <b>root device</b> for the main view.
          </>,
          <>
            {
              <button className="z-10 p-1 rounded-full text-white transition-all duration-200 hover:bg-green-600 bg-green-500">
                {UI_ICONS.add}
              </button>
            }{" "}
            <b>Adds</b> a new device to the diagram.
          </>,
          <>
            {
              <button
                className={`z-10 p-1.5 rounded-full text-white transition-all duration-200 bg-orange-400 hover:bg-orange-400`}
              >
                {React.cloneElement(UI_ICONS.edit, {
                  className: `w-2 h-2`,
                })}
              </button>
            }{" "}
            Enters <b>Edit Mode</b> to move nodes, create connections, etc.
          </>,
          <>
            {
              <button
                className={`p-1 bg-[#ef4444] rounded-full text-white transition-all duration-300 ease-in-out hover:bg-[#d43c3c] focus:outline-none cursor-pointer`}
              >
                {UI_ICONS.undo}
              </button>
            }{" "}
            <b>Undoes</b> the last change in Edit Mode.
          </>,
          <>
            {
              <button className="z-10 rounded-full bg-blue-500 p-1 text-white transition-all duration-200 hover:bg-blue-600">
                {UI_ICONS.expand}
              </button>
            }{" "}
            <b>Adjusts</b> the view and centers it.
          </>,
          <>
            {
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 rounded-full shadow-md text-white bg-[#ef4444] hover:bg-[#d43c3c] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rotate-90 hover:rotate-0"
              >
                {UI_ICONS.reset}
              </button>
            }{" "}
            <b>Resets</b> the layout.
          </>,
          <>
            {
              <button
                className={`relative z-20 p-1 rounded-full text-white bg-blue-500 hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Export Diagram"
              >
                {UI_ICONS.download}
              </button>
            }{" "}
            <b>Exports</b> the visible diagram.
          </>,
          <>
            {
              <button
                className={`p-1 rounded-full text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-600`}
                title={"Toggle Cable Labels"}
              >
                {UI_ICONS.tag}
              </button>
            }{" "}
            <b>Shows/Hides</b> cable descriptions.
          </>,
          <>
            {
              <button
                className={`p-1 rounded-full text-white bg-blue-500 hover:bg-blue-600 transition-all duration-200`}
                title="Trace Network Path"
              >
                {UI_ICONS.route}
              </button>
            }{" "}
            <b>Shows full path</b> between 2 devices.
          </>,
          <>
            {
              <button
                className="px-0.5 py-1 bg-blue-500 rounded-r-sm shadow-md hover:bg-blue-600 transition-all duration-200 text-white"
                title="Open Inventory"
              >
                {UI_ICONS.chevronRight_main}
              </button>
            }{" "}
            Accesses your <b>inventory</b>.
          </>,
          <>
            Connections are made from{" "}
            <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-1" />{" "}
            ⟶{" "}
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1" />
          </>,
          <>
            Clicking any device <b>Expands</b> or <b>Collapses</b> its children.
          </>,
          <>
            Hovering on{" "}
            {
              <button className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700">
                {UI_ICONS.info}
              </button>
            }{" "}
            on an ONU node displays <b>customer details.</b>
          </>,
          <>
            Clicking on{" "}
            {
              <button className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700">
                {UI_ICONS.info}
              </button>
            }{" "}
            displays <b>device details.</b>
          </>,
          <>
            Clicking{" "}
            {
              <button className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700">
                {UI_ICONS.chevronRight}
              </button>
            }{" "}
            on an OLT node opens the <b>OLT view.</b>
          </>,
        ],
      };

  return (
    <div className="absolute bottom-4 right-2 md:right-4 z-10">
      <div
        className={`w-84 rounded-lg border border-slate-200 bg-white/80 p-4 shadow-md backdrop-blur-sm z-20 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <h3 className="mb-2 text-lg font-bold text-slate-800">
          {helpContent.title}
        </h3>
        <ul className="list-inside list-disc space-y-2 text-sm text-slate-600">
          {helpContent.points.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
        <div className="mt-2 border-t border-slate-300 pt-1 text-[10px] text-slate-400 text-center">
          Built using{" "}
          <a
            href="https://github.com/xyflow/xyflow"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-500 transition-colors duration-200"
          >
            xyflow
          </a>{" "}
          © webkid GmbH (MIT License)
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-all duration-200"
        >
          {isOpen ? UI_ICONS.cross : UI_ICONS.question}
        </button>
      </div>
    </div>
  );
};

export default HelpBox;
