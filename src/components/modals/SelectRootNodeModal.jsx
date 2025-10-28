/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { fetchRootCandidates } from "../../utils/graphUtils";

const SelectRootNodeModal = ({ isOpen, onClose, onSelect }) => {
  const [nodes, setNodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      const fetchNodes = async () => {
        try {
          const data = await fetchRootCandidates();
          setNodes(data);
        } catch (error) {
          console.log(error)
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
    onSelect(nodeId);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex w-96 flex-col rounded-lg bg-white p-4 shadow-xl">
        <h3 className="mb-2 text-lg font-bold text-slate-800">
          Select a Root Node
        </h3>
        <input
          type="text"
          placeholder="Search for a device..."
          className="w-full p-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
        <ul className="max-h-64 overflow-y-auto">
          {filteredNodes.length > 0 ? (
            filteredNodes.map((node) => (
              <li
                key={node.id}
                onClick={() => handleSelect(node.id)}
                className="cursor-pointer rounded-md px-3 py-2 text-slate-700 hover:bg-gray-100"
              >
                {node.name}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-slate-500">No devices found.</li>
          )}
        </ul>
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SelectRootNodeModal;
