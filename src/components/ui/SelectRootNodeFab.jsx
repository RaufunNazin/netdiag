/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { fetchRootCandidates } from "../../utils/graphUtils";

const SelectRootNodeFab = ({ onSelectRoot }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      const fetchNodes = async () => {
        try {
          const data = await fetchRootCandidates();
          setNodes(data);
        } catch (error) {
          // Error is handled in graphUtils
        }
      };
      fetchNodes();
    }
  }, [isOpen]);

  const filteredNodes = searchTerm
    ? nodes.filter((node) =>
        node.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : nodes;

  const handleSelect = (nodeId) => {
    setIsOpen(false);
    onSelectRoot(nodeId);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-4 left-4 z-10 rounded-full bg-blue-500 p-3 text-white shadow-lg transition-all duration-200 hover:bg-blue-600"
        title="Select Root Node"
      >
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
          <rect x="3" y="3" width="7" height="7" rx="1"></rect>
          <rect x="14" y="3" width="7" height="7" rx="1"></rect>
          <rect x="14" y="14" width="7" height="7" rx="1"></rect>
          <path d="M6.5 10v4M17.5 10v4M6.5 17.5H14"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex w-96 flex-col rounded-lg bg-white p-4 shadow-xl">
            <h3 className="mb-2 text-lg font-bold text-slate-800">
              Select a Root Node
            </h3>
            <input
              type="text"
              placeholder="Search for a device..."
              className="input-style mb-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <ul className="max-h-64 overflow-y-auto">
              {filteredNodes.map((node) => (
                <li
                  key={node.id}
                  onClick={() => handleSelect(node.id)}
                  className="cursor-pointer rounded-md px-3 py-2 text-slate-700 hover:bg-gray-100"
                >
                  {node.name}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setIsOpen(false)}
              className="btn-secondary mt-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SelectRootNodeFab;
