import { useState, useEffect } from "react";
import { UI_ICONS } from "../../utils/icons";

const IconDock = ({ children }) => {
  const [isOpen, setIsOpen] = useState(() => {
    const savedState = localStorage.getItem("isDockOpen");
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  useEffect(() => {
    localStorage.setItem("isDockOpen", JSON.stringify(isOpen));
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;

      if (e.key.toLowerCase() === "b") {
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
      className="fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 
                 items-center rounded-full border border-neutral-200/70 dark:border-neutral-800/70 
                 bg-white/80 dark:bg-neutral-900/80 p-2 shadow-none backdrop-blur-sm"
    >
      <div
        className={`flex items-center gap-2 overflow-hidden transition-all 
                   duration-500 ease-in-out bg-transparent
                   ${isOpen ? "max-w-md opacity-100" : "max-w-0 opacity-0"}`}
      >
        {children}
      </div>

      <button
        onClick={toggleDock}
        // Added dark:text-neutral-300
        className={`flex h-10 w-10 shrink-0 items-center justify-center 
                   rounded-full bg-transparent text-neutral-600 dark:text-neutral-300 transition-all 
                   duration-500 ease-in-out ${isOpen ? "ml-2" : "ml-0"}`}
        title={isOpen ? "Hide Bottom Dock [B]" : "Show Bottom Dock [B]"}
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

export default IconDock;
