import { useState } from "react";
import { FaExpand } from "react-icons/fa6";
import { IoArrowUndoOutline } from "react-icons/io5";

const HelpBox = ({ isEmpty }) => {
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
              <button
                className="z-10 rounded-full bg-blue-500 p-1 text-white transition-all duration-200 hover:bg-blue-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="8.5" y="3" width="7" height="7" rx="1"></rect>
                  <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                  <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                  <path d="M12 10 V 13 H 6.5 V 14 M12 13 H 17.5 V 14"></path>
                </svg>
              </button>
            }{" "}
            to select a new <b>root device</b> for the main view.
          </>,
          <>
            Click{" "}
            {
              <button
                className="z-10 p-1 rounded-full text-white transition-all duration-200 hover:bg-green-600 bg-green-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14"></path>
                  <path d="M5 12h14"></path>
                </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
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
                <IoArrowUndoOutline size={12} />
              </button>
            }{" "}
            to <b>undo</b> the last change in Edit Mode.
          </>,
          <>
            Click{" "}
            {
              <button
                className="z-10 rounded-full bg-blue-500 p-1 text-white transition-all duration-200 hover:bg-blue-600"
              >
                <FaExpand size={12} />
              </button>
            }{" "}
            to <b>adjust</b> the view and fit all nodes on screen.
          </>,
          <>
            Use{" "}
            {
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 rounded-full shadow-lg text-white bg-[#ef4444] hover:bg-[#d43c3c] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rotate-90 hover:rotate-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
              </button>
            }{" "}
            to <b>reset</b> the layout.
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
              <button
                className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4M12 8h.01"></path>
                </svg>
              </button>
            }{" "}
            on an ONU node to view <b>customer details.</b>
          </>,
          <>
            Click on{" "}
            {
              <button
                className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4M12 8h.01"></path>
                </svg>
              </button>
            }{" "}
            on any device to view <b>device details.</b>
          </>,
          <>
            Click{" "}
            {
              <button
                className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6"></path>
                </svg>
              </button>
            }{" "}
            on an OLT node to enter <b>OLT view.</b>
          </>,
        ],
      };

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <div
        className={`w-84 rounded-lg border border-gray-200 bg-white/70 p-4 shadow-lg backdrop-blur-sm z-20 ${
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
      </div>
      <div className="flex justify-end mt-2">
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
