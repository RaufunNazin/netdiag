import { useState } from "react";
import { UI_ICONS } from "../../utils/icons";

const HelpBox = ({ isEmpty }) => {
  const [isOpen, setIsOpen] = useState(false);

  const helpContent = isEmpty
    ? {
        title: "Getting Started",
        points: [
          <>
            Your network is empty. Click the <b>plus icon</b> below to add your
            first device.
          </>,
          "Once you add a device, other options like Edit Mode will become available.",
        ],
      }
    : {
        title: "How to Use",
        points: [
          <>
            Use the <b>Search bar</b> (top right) to find any device.
          </>,

          <>
            Click{" "}
            {
              <button className="z-10 rounded-full bg-blue-500 p-1 text-white transition-all duration-200 hover:bg-blue-600">
                {UI_ICONS.root}
              </button>
            }{" "}
            to select a new <b>root device</b> for the main view.
          </>,
          <>
            Click{" "}
            {
              <button className="z-10 p-1 rounded-full text-white transition-all duration-200 hover:bg-green-600 bg-green-500">
                {UI_ICONS.add}
              </button>
            }{" "}
            to <b>add</b> a new device to the diagram.
          </>,
          <>
            Click{" "}
            {
              <button
                className={`z-10 p-1.5 rounded-full text-white transition-all duration-200 bg-blue-500 hover:bg-blue-600`}
              >
                {UI_ICONS.edit}
              </button>
            }{" "}
            to enter <b>Edit Mode</b> to move nodes, create connections, or
            right-click for more options.
          </>,
          <>
            Click{" "}
            {
              <button
                className={`p-1 bg-[#ef4444] rounded-full text-white transition-all duration-300 ease-in-out hover:bg-[#d43c3c] focus:outline-none cursor-pointer`}
              >
                {UI_ICONS.undo}
              </button>
            }{" "}
            to <b>undo</b> the last change in Edit Mode.
          </>,
          <>
            Click{" "}
            {
              <button className="z-10 rounded-full bg-blue-500 p-1 text-white transition-all duration-200 hover:bg-blue-600">
                {UI_ICONS.expand}
              </button>
            }{" "}
            to <b>adjust</b> the view and fit all nodes on screen.
          </>,
          <>
            Use{" "}
            {
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 rounded-full shadow-md text-white bg-[#ef4444] hover:bg-[#d43c3c] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rotate-90 hover:rotate-0"
              >
                {UI_ICONS.reset}
              </button>
            }{" "}
            to <b>reset</b> the layout.
          </>,
          <>
            Click{" "}
            {
              <button
                className="px-0 py-1 bg-blue-500 rounded-r-sm shadow-md hover:bg-blue-600 transition-all duration-200 text-white"
                title="Open Inventory"
              >
                {UI_ICONS.chevronRight_main}
              </button>
            }{" "}
            to access your <b>inventory</b>.
          </>,
          <>
            Connection possible from{" "}
            <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-1" />{" "}
            ⟶{" "}
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1" />
          </>,
          <>
            Click any device to <b>Expand</b> or <b>Collapse</b> its children.
          </>,
          <>
            Hover on{" "}
            {
              <button className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700">
                {UI_ICONS.info}
              </button>
            }{" "}
            on an ONU node to view <b>customer details.</b>
          </>,
          <>
            Click on{" "}
            {
              <button className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700">
                {UI_ICONS.info}
              </button>
            }{" "}
            on any device to view <b>device details.</b>
          </>,
          <>
            Click{" "}
            {
              <button className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700">
                {UI_ICONS.chevronRight}
              </button>
            }{" "}
            on an OLT node to enter <b>OLT view.</b>
          </>,
        ],
      };

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <div
        className={`w-84 rounded-lg border border-gray-200 bg-white/80 p-4 shadow-md backdrop-blur-sm z-20 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <h3 className="mb-2 text-lg font-bold text-gray-800">
          {helpContent.title}
        </h3>
        <ul className="list-inside list-disc space-y-2 text-sm text-gray-600">
          {helpContent.points.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
        <div className="mt-2 border-t border-gray-300 pt-1 text-[10px] text-gray-400 text-center">
          Built using{" "}
          <a
            href="https://github.com/xyflow/xyflow"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-500 transition-colors duration-200"
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
