import React, { useState } from "react";

const SearchControl = ({ nodes, onNodeFound }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 1) {
      setResults(
        nodes.filter((n) =>
          n.data.label.toLowerCase().includes(val.toLowerCase())
        )
      );
    } else {
      setResults([]);
    }
  };

  const handleSelect = (nodeId) => {
    onNodeFound(nodeId);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="absolute top-4 right-4 z-10 bg-white/90 rounded-lg w-64">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search any device..."
        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-0"
      />
      {results.length > 0 && (
        <ul className="mt-1 p-1 border border-gray-200 rounded-lg bg-white">
          {results.slice(0, 5).map((node) => (
            <li
              key={node.id}
              onClick={() => handleSelect(node.id)}
              className="p-2 hover:bg-gray-100 cursor-pointer rounded-sm"
            >
              {node.data.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchControl;
