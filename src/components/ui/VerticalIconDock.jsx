import { useState, useEffect } from "react";
import { UI_ICONS } from "../../utils/icons";

const VerticalIconDock = ({ children, className = "" }) => {
  const [isOpen, setIsOpen] = useState(() => {
    // Use a unique key for this dock's local storage
    const savedState = localStorage.getItem("isVerticalDockOpen");
    return savedState !== null ? JSON.parse(savedState) : false; // Default to closed
  });

  // Save open/closed state to local storage
  useEffect(() => {
    localStorage.setItem("isVerticalDockOpen", JSON.stringify(isOpen));
  }, [isOpen]);

  const toggleDock = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    // This is the main container, combining both elements
    <div
      className={`fixed bottom-4 left-2 md:left-4 z-20 flex flex-col items-center 
                 rounded-full border border-slate-200/70 
                 bg-white/80 p-2 shadow-none backdrop-blur-sm ${className}`}
    >
      {/* Menu that expands upwards. 
          flex-col-reverse stacks items from bottom to top. */}
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

      {/* Toggle Button - Now part of the same container */}
      <button
        onClick={toggleDock}
        className={`flex h-10 w-10 shrink-0 items-center justify-center 
                   rounded-full bg-transparent text-slate-600 transition-all 
                   duration-500 ease-in-out`}
        title={isOpen ? "Hide Tools" : "Show Tools"}
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
