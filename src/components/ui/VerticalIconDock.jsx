import { useState, useEffect } from "react";
import { UI_ICONS } from "../../utils/icons";

const VerticalIconDock = ({ children, className = "" }) => {
  const [isOpen, setIsOpen] = useState(() => {
    const savedState = localStorage.getItem("isVerticalDockOpen");
    return savedState !== null ? JSON.parse(savedState) : false;
  });

  useEffect(() => {
    localStorage.setItem("isVerticalDockOpen", JSON.stringify(isOpen));
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;

      if (e.key.toLowerCase() === "v") {
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleDock = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      // Added dark:border-slate-700/70 and dark:bg-slate-800/80
      className={`fixed bottom-4 left-2 md:left-4 z-20 flex flex-col items-center 
                 rounded-full border border-slate-200/70 dark:border-slate-700/70 
                 bg-white/80 dark:bg-slate-800/80 p-2 shadow-none backdrop-blur-sm ${className}`}
    >
      <div
        className={`flex flex-col-reverse items-center gap-2 overflow-hidden 
                   transition-all duration-500 ease-in-out
                   ${
                     isOpen
                       ? "max-h-96 opacity-100 mb-2"
                       : "max-h-0 opacity-0 mb-0"
                   }`}
      >
        {children}
      </div>

      <button
        onClick={toggleDock}
        // Added dark:text-slate-300
        className={`flex h-10 w-10 shrink-0 items-center justify-center 
                   rounded-full bg-transparent text-slate-600 dark:text-slate-300 transition-all 
                   duration-500 ease-in-out`}
        title={isOpen ? "Hide Vertical Dock [V]" : "Show Vertical Dock [V]"}
      >
        <span
          className={`transition-transform duration-500 ease-in-out 
                     ${isOpen ? "rotate-180" : "rotate-0"}`}
        >
          {UI_ICONS.chevronUp}
        </span>
      </button>
    </div>
  );
};

export default VerticalIconDock;
