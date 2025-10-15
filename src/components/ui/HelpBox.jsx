import React, { useState } from "react";

const HelpBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const icons = {
    question: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
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
        width="24"
        height="24"
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
        className={`w-72 rounded-lg border border-gray-200 bg-white/50 p-4 shadow-lg backdrop-blur-sm z-20 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <h3 className="mb-2 text-lg font-bold text-gray-800">How to Use</h3>
        <ul className="list-inside list-disc space-y-2 text-sm text-gray-600">
          <li>
            Click the <b>pencil icon</b> to enter <b>Edit Mode</b>.
          </li>
          <li>
            In <b>Edit Mode</b>, you can drag devices, reconnect lines, or
            right-click for more options.
          </li>
          <li>
            Click the <b>plus icon</b> to add a new device to the diagram.
          </li>
          <li>
            Click the <b>sitemap icon</b> to select a new root node for the
            view.
          </li>
          <li>
            <b>Expand or Collapse</b> a branch by clicking on a device.
          </li>
          <li>
            <b>Pan and Zoom</b> by dragging the background and using your mouse
            wheel.
          </li>
        </ul>
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-200"
        >
          {isOpen ? icons.cross : icons.question}
        </button>
      </div>
    </div>
  );
};

export default HelpBox;
