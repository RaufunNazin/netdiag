import { useEffect } from "react";
import { UI_ICONS } from "../../utils/icons";

const WelcomeModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen && e.key === "Enter") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-neutral-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-neutral-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 transition-colors">
        <div className="mb-6 flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
            {UI_ICONS.info_main}
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-50">
              Welcome to Network Diagram
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Follow these steps to create your diagram.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400">
              <span className="text-xs font-bold">1</span>
            </div>
            <div>
              <p className="font-semibold text-neutral-700 dark:text-neutral-200">
                Add Devices
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Click the{" "}
                <span className="inline-flex p-1 bg-green-500 rounded-full text-white scale-95">
                  {UI_ICONS.add}
                </span>{" "}
                button in the bottom dock to add Routers, Switches, or OLTs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <span className="text-xs font-bold">2</span>
            </div>
            <div>
              <p className="font-semibold text-neutral-700 dark:text-neutral-200">
                Connect & Edit
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Toggle <strong>Edit Mode</strong>{" "}
                <span className="inline-flex p-1 bg-blue-500 rounded-full text-white">
                  {UI_ICONS.edit}
                </span>
                . Drag from the{" "}
                <span className="text-orange-500 font-bold">Orange</span> handle
                (source) to the{" "}
                <span className="text-blue-500 font-bold">Blue</span> handle
                (target) to link devices.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
              <span className="text-xs font-bold">3</span>
            </div>
            <div>
              <p className="font-semibold text-neutral-700 dark:text-neutral-200">
                Set Root & Layout
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Use the <strong>Hierarchy</strong> button{" "}
                <span className="inline-flex p-1 bg-blue-500 rounded-full text-white scale-95">
                  {UI_ICONS.root}
                </span>{" "}
                (left dock) to define the main device. This helps with
                auto-layout.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Got it, Let's Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
