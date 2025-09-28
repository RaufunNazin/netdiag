import React, { useState } from "react";

const HelpBox = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <div
        className={`bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 w-72 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <h3 className="text-lg font-bold text-gray-800 mb-2">How to Use</h3>
        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
          <li>
            <b>Double-click</b> a device to expand or collapse its branch.
          </li>
          <li>
            <b>Right-click</b> on an item for more actions like editing or
            deleting.
          </li>
          <li>
            <b>Drag lines</b> from one connection point to another to reconnect
            them.
          </li>
          <li>
            Connections go from an <b>orange</b> point (right) to a <b>green</b>{" "}
            point (left).
          </li>
          <li>
            <b>Pan & Zoom</b> using your mouse or the controls in the top-left.
          </li>
        </ul>
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="mt-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-blue-600 transition-transform hover:scale-105"
        >
          {isOpen ? "✘" : "?"}
        </button>
      </div>
    </div>
  );
};

export default HelpBox;
