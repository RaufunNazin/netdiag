import { useState, useEffect, useRef } from "react";
import api from "../../api";
import { UI_ICONS } from "../../utils/icons";

const AsyncDeviceSelect = ({ label, placeholder, onSelect, selectedItem }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const { data } = await api.get(`/search/devices?q=${query}`);
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    onSelect(item);
    setIsOpen(false);
    setQuery("");
  };

  const clearSelection = () => {
    onSelect(null);
    setQuery("");
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {selectedItem ? (
        <div
          className={`flex items-center justify-between w-full p-2 rounded-lg border transition-colors ${
            label === "Source"
              ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
              : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
          }`}
        >
          <div className="flex flex-col overflow-hidden">
            <span
              className={`text-[10px] font-bold uppercase ${
                label === "Source"
                  ? "text-green-600 dark:text-green-400"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            >
              {label}
            </span>
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 truncate">
              {selectedItem.name}
            </span>
          </div>
          <button
            onClick={clearSelection}
            className="text-neutral-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 p-1 transition-colors"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder={placeholder || "Type to search..."}
            className="w-full p-2.5 pl-9 text-sm bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-neutral-400 dark:placeholder-neutral-500"
          />
          <div className="absolute left-3 top-2.5 text-neutral-400 dark:text-neutral-500">
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-neutral-400 dark:border-neutral-500 border-t-transparent rounded-full" />
            ) : (
              UI_ICONS.search
            )}
          </div>
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {results.map((node) => (
            <div
              key={node.id}
              onClick={() => handleSelect(node)}
              className="p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer border-b border-neutral-50 dark:border-neutral-800/50 last:border-0 flex items-center justify-between group transition-colors"
            >
              <span className="text-sm text-neutral-700 dark:text-neutral-200 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {node.name}
              </span>
              <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded-full">
                {node.node_type}
              </span>
            </div>
          ))}
        </div>
      )}

      {isOpen && results.length === 0 && query.length >= 2 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl p-3 text-center text-xs text-neutral-500 dark:text-neutral-400">
          No devices found.
        </div>
      )}
    </div>
  );
};

export default AsyncDeviceSelect;
