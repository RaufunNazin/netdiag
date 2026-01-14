import { useState, useEffect, useCallback } from "react";
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
          console.log(error);
        }
      };
      fetchNodes();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen && e.key === "Enter") {
        e.preventDefault();
        // If there are filtered nodes, select the first one
        if (filteredNodes.length > 0) {
          handleSelect(filteredNodes[0].id);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredNodes, handleSelect]);

  const filteredNodes = searchTerm
    ? nodes.filter((node) =>
        node.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : nodes;

  const handleSelect = useCallback(
    (nodeId) => {
      onSelect(nodeId);
      onClose();
    },
    [onSelect, onClose]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex w-96 flex-col rounded-lg bg-white dark:bg-neutral-900 p-4 shadow-xl transition-colors">
        <h3 className="mb-2 text-lg font-bold text-neutral-800 dark:text-neutral-50">
          Select a Root Node
        </h3>
        <input
          type="text"
          placeholder="Search for a device..."
          className="w-full p-2 border border-neutral-300 dark:border-neutral-700 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
        <ul className="max-h-64 overflow-y-auto custom-scrollbar">
          {filteredNodes.length > 0 ? (
            filteredNodes.map((node) => (
              <li
                key={node.id}
                onClick={() => handleSelect(node.id)}
                className="cursor-pointer rounded-md px-3 py-2 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {node.name}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-neutral-500 dark:text-neutral-400">
              No devices found.
            </li>
          )}
        </ul>
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SelectRootNodeModal;
