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
      // Added dark:border-neutral-800/70 and dark:bg-neutral-900/80
      className={`fixed bottom-4 left-2 md:left-4 z-20 flex flex-col items-center 
                 rounded-full border border-neutral-200/70 dark:border-neutral-800/70 
                 bg-white/80 dark:bg-neutral-900/80 p-2 shadow-none backdrop-blur-sm ${className}`}
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
        // Added dark:text-neutral-300
        className={`flex h-10 w-10 shrink-0 items-center justify-center 
                   rounded-full bg-transparent text-neutral-600 dark:text-neutral-300 transition-all 
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
