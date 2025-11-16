import { useState } from "react";

const SearchControl = ({ nodes, onNodeFound, diagramRoots }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 0) {
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
    setIsFocused(false);
  };

  const showRootList =
    isFocused &&
    query.length === 0 &&
    results.length === 0 &&
    (diagramRoots?.main || diagramRoots?.sub?.length > 0);

  return (
    <div className="absolute top-4 right-4 z-10 bg-white/80 rounded-lg w-76 backdrop-blur-sm">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder="Search any device..."
        className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-0"
      />

      {results.length > 0 && (
        <ul className="mt-1 p-1 border border-slate-200 rounded-lg bg-transparent shadow-none">
          {results.slice(0, 5).map((node) => (
            <li
              key={node.id}
              onClick={() => handleSelect(node.id)}
              className="p-2 hover:bg-slate-100 cursor-pointer rounded-sm"
            >
              {node.data.label.length > 20
                ? `${node.data.label.slice(0, 20)}...`
                : node.data.label}
            </li>
          ))}
        </ul>
      )}

      {showRootList && (
        <ul className="mt-1 p-1 border border-slate-200 rounded-lg bg-transparent shadow-none">
          {diagramRoots.main && (
            <li
              key={diagramRoots.main.id}
              onClick={() => handleSelect(diagramRoots.main.id)}
              className="p-2 hover:bg-slate-100 cursor-pointer rounded-sm flex justify-between items-center"
            >
              <span>
                {diagramRoots.main.data.label.length > 20
                  ? `${diagramRoots.main.data.label.slice(0, 20)}...`
                  : diagramRoots.main.data.label}
              </span>
              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                Root
              </span>
            </li>
          )}
          {diagramRoots.sub.map((node) => (
            <li
              key={node.id}
              onClick={() => handleSelect(node.id)}
              className="p-2 hover:bg-slate-100 cursor-pointer rounded-sm flex justify-between items-center"
            >
              <span>
                {node.data.label.length > 20
                  ? `${node.data.label.slice(0, 20)}...`
                  : node.data.label}
              </span>
              <span className="text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
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
