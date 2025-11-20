import { UI_ICONS } from "../../utils/icons";

const WelcomeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            {UI_ICONS.info_main}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Welcome to Network Diagram
            </h2>
            <p className="text-sm text-slate-500">
              Follow these steps to create your diagram.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
              <span className="text-xs font-bold">1</span>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Add Devices</p>
              <p className="text-sm text-slate-600">
                Click the{" "}
                <span className="inline-flex p-1 bg-green-500 rounded-full text-white scale-95">
                  {UI_ICONS.add}
                </span>{" "}
                button in the bottom dock to add Routers, Switches, or OLTs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <span className="text-xs font-bold">2</span>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Connect & Edit</p>
              <p className="text-sm text-slate-600">
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
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <span className="text-xs font-bold">3</span>
            </div>
            <div>
              <p className="font-semibold text-slate-700">Set Root & Layout</p>
              <p className="text-sm text-slate-600">
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
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Got it, Let's Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
