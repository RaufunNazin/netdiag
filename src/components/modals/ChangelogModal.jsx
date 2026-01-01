import React, { useState, useEffect } from "react";
import { APP_CHANGELOGS } from "../../utils/changelogData";
import { UI_ICONS } from "../../utils/icons";

const STORAGE_KEY = "netdiag_seen_version";

const ChangelogModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLog, setCurrentLog] = useState(null);

  useEffect(() => {
    const latestLog = APP_CHANGELOGS[0];
    const seenVersion = localStorage.getItem(STORAGE_KEY);

    if (!seenVersion || seenVersion !== latestLog.version) {
      setCurrentLog(latestLog);
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    if (currentLog) {
      localStorage.setItem(STORAGE_KEY, currentLog.version);
    }
    setIsOpen(false);
  };

  if (!isOpen || !currentLog) return null;

  return (
    <div className="fixed inset-0 bg-neutral-900/60 dark:bg-neutral-950/80 z-[300] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden transform transition-all scale-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h2 className="text-2xl font-bold">{currentLog.title}</h2>
              <p className="text-blue-100 text-sm mt-1">
                Released on <span className="font-bold">{currentLog.date}</span>{" "}
                - <span className="text-blue-100">v{currentLog.version}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <ul className="space-y-4">
            {currentLog.features.map((item, index) => (
              <li key={index} className="flex items-center gap-4 group">
                <div className="p-2 bg-neutral-100 dark:bg-neutral-800/50 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-neutral-700 transition-colors">
                  {React.cloneElement(item.icon || UI_ICONS.check, {
                    className: "w-4 h-4",
                  })}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {item.text}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-900 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white text-sm font-semibold rounded-lg shadow-md transition-all active:scale-95"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangelogModal;
