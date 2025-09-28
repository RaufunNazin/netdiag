import React, { useState } from "react";

const HelpBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const icons = {
    question: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9.09 9a3 3 0 0 1 5.818 0c0 2-3 3-3 3v.01"></path>
        <path d="M12 17h.01"></path>
      </svg>
    ),
    cross: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    ),
  };

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
          className="mt-2 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-200"
        >
          {isOpen ? icons.cross : icons.question}
        </button>
      </div>
    </div>
  );
};

export default HelpBox;
