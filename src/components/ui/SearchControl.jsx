import { useState, useEffect, useRef } from "react";
import { UI_ICONS } from "../../utils/icons";
import { MODE } from "../../utils/enums";

const SearchControl = ({ nodes, onNodeFound, diagramRoots, customerIndex }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [mode, setMode] = useState(MODE.DEVICE);

  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const normalize = (str) => {
    return str
      ? str
          .toString()
          .replace(/[^a-zA-Z0-9]/g, "")
          .toLowerCase()
      : "";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsExpanded(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (val.length < 2) {
      setResults([]);
      return;
    }

    const lowerVal = val.toLowerCase();
    const normalizedVal = normalize(val);

    if (mode === MODE.DEVICE) {
      setResults(
        nodes
          .filter((n) => n.data.label.toLowerCase().includes(lowerVal))
          .slice(0, 10)
      );
    } else {
      if (!customerIndex || customerIndex.length === 0) {
        setResults([]);
        return;
      }

      const matches = [];
      for (let i = 0; i < customerIndex.length; i++) {
        const c = customerIndex[i];
        const cidStr = c.cid ? c.cid.toString().toLowerCase() : "";
        const unameStr = c.uname ? c.uname.toString().toLowerCase() : "";
        const macStr = c.mac ? c.mac.toString() : "";
        const normalizedMac = normalize(macStr);

        if (
          cidStr.includes(lowerVal) ||
          unameStr.includes(lowerVal) ||
          macStr.toLowerCase().includes(lowerVal) ||
          normalizedMac.includes(normalizedVal)
        ) {
          matches.push(c);
          if (matches.length >= 10) break;
        }
      }
      setResults(matches);
    }
  };

  const handleSelect = (item) => {
    if (mode === MODE.DEVICE) {
      onNodeFound(item.id);
    } else {
      if (item.onu_id) {
        onNodeFound(String(item.onu_id));
      }
    }
    setQuery("");
    setResults([]);
    setIsFocused(false);
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setQuery("");
    setResults([]);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    // Select result on Enter
    if (e.key === "Enter" && results.length > 0) {
      handleSelect(results[0]);
      e.target.blur();
    }

    // Collapse on Escape
    if (e.key === "Escape") {
      e.preventDefault(); // Prevent default browser behavior
      e.stopPropagation(); // Stop event bubbling
      setIsExpanded(false);
      setQuery("");
      setResults([]);
      e.target.blur(); // Remove focus from input
    }

    if (e.key === "Tab") {
      e.preventDefault(); // Prevent focus from moving to the next element
      const newMode = mode === MODE.DEVICE ? MODE.USER : MODE.DEVICE;
      handleModeSwitch(newMode);
    }
  };

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = (e) => {
    e.stopPropagation();
    setIsExpanded(false);
    setQuery("");
    setResults([]);
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setIsExpanded(true);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
          }
        }, 50);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const showRootList =
    isFocused &&
    query.length === 0 &&
    results.length === 0 &&
    mode === MODE.DEVICE &&
    (diagramRoots?.main || diagramRoots?.sub?.length > 0);

  return (
    <div
      ref={containerRef}
      className={`absolute top-4 right-4 z-10 flex flex-col gap-2 transition-all duration-500 ease-in-out ${
        isExpanded ? "w-96" : "w-10"
      }`}
    >
      <div
        className={`bg-white/90 rounded-lg backdrop-blur-sm border border-slate-200 flex items-center overflow-hidden h-10 transition-colors duration-300 ${
          isExpanded ? "bg-white" : "hover:bg-slate-50 cursor-pointer"
        }`}
        onClick={!isExpanded ? handleExpand : undefined}
      >
        <div
          className={`flex items-center justify-center text-slate-500 shrink-0 transition-all duration-300 ease-in-out pr-1 ${
            isExpanded ? "w-0 opacity-0 overflow-hidden" : "w-10 opacity-100"
          }`}
        >
          {UI_ICONS.search}
        </div>

        <div
          className={`flex flex-1 items-center pl-1 pr-2 transition-opacity duration-300 ${
            isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex bg-slate-100 rounded-md p-0.5 mr-2 shrink-0">
            <button
              onClick={() => handleModeSwitch(MODE.DEVICE)}
              className={`p-1 rounded-md transition-all duration-200 flex items-center justify-center ${
                mode === MODE.DEVICE
                  ? "bg-white text-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Search Devices"
              tabIndex={isExpanded ? 0 : -1}
            >
              {UI_ICONS.device}
            </button>
            <button
              onClick={() => handleModeSwitch(MODE.USER)}
              className={`p-1 rounded-md transition-all duration-200 flex items-center justify-center ${
                mode === MODE.USER
                  ? "bg-white text-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Search Users"
              tabIndex={isExpanded ? 0 : -1}
            >
              {UI_ICONS.user}
            </button>
          </div>

          <input
            id="diagram-search-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={
              mode === MODE.DEVICE ? "Search Devices..." : "Search Users..."
            }
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none min-w-0"
            tabIndex={isExpanded ? 0 : -1}
          />

          <button
            onClick={handleCollapse}
            className="ml-1 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            title="Close Search [ESC]"
            tabIndex={isExpanded ? 0 : -1}
          >
            {UI_ICONS.cross}
          </button>
        </div>
      </div>

      {isExpanded && (results.length > 0 || showRootList) && (
        <div className="bg-white/95 rounded-lg border border-slate-200 overflow-hidden max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          <ul className="py-1">
            {results.map((item, idx) => (
              <li
                key={idx}
                onClick={() => handleSelect(item)}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0"
              >
                {mode === MODE.DEVICE ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      {item.data.label}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">
                          {item.uname || "Unknown username"}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          ID: {item.cid || "N/A"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded h-fit">
                        {item.onu_name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {item.mac}
                    </span>
                  </div>
                )}
              </li>
            ))}

            {showRootList && (
              <>
                <li className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                  Roots
                </li>
                {diagramRoots.main && (
                  <li
                    onClick={() => handleSelect(diagramRoots.main)}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                  >
                    <span className="text-sm text-slate-700">
                      {diagramRoots.main.data.label}
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                      Main
                    </span>
                  </li>
                )}
                {diagramRoots.sub.map((node) => (
                  <li
                    key={node.id}
                    onClick={() => handleSelect(node)}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                  >
                    <span className="text-sm text-slate-700">
                      {node.data.label}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                      Sub
                    </span>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchControl;
