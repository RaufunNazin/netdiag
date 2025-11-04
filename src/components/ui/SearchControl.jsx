import { useState } from "react";

const SearchControl = ({ nodes, onNodeFound, diagramRoots }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 0) {
      // Show results on 1+ chars
      setResults(
        nodes.filter((n) =>
          n.data.label.toLowerCase().includes(val.toLowerCase())
        )
      );
    } else {
      setResults([]); // Clear results if query is empty
    }
  };

  const handleSelect = (nodeId) => {
    onNodeFound(nodeId);
    setQuery("");
    setResults([]);
    setIsFocused(false); // Hide all lists
  };

  // Check if we should show the root list
  const showRootList =
    isFocused &&
    query.length === 0 &&
    results.length === 0 &&
    (diagramRoots?.main || diagramRoots?.sub?.length > 0);

  return (
    <div className="absolute top-4 right-4 z-10 bg-white/90 rounded-lg w-64">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Delay to allow click on results
        placeholder="Search any device..."
        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-0"
      />

      {/* Condition 1: Show Search Results */}
      {results.length > 0 && (
        <ul className="mt-1 p-1 border border-gray-200 rounded-lg bg-white shadow-lg">
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

      {/* Condition 2: Show Root List */}
      {showRootList && (
        <ul className="mt-1 p-1 border border-gray-200 rounded-lg bg-white shadow-lg">
          {diagramRoots.main && (
            <li
              key={diagramRoots.main.id}
              onClick={() => handleSelect(diagramRoots.main.id)}
              className="p-2 hover:bg-gray-100 cursor-pointer rounded-sm flex justify-between items-center"
            >
              <span>{diagramRoots.main.data.label}</span>
              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                Root
              </span>
            </li>
          )}
          {diagramRoots.sub.map((node) => (
            <li
              key={node.id}
              onClick={() => handleSelect(node.id)}
              className="p-2 hover:bg-gray-100 cursor-pointer rounded-sm flex justify-between items-center"
            >
              <span>{node.data.label}</span>
              <span className="text-xs bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full">
                Sub-root
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchControl;
