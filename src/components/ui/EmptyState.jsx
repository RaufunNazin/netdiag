import { UI_ICONS } from "../../utils/icons";
const EmptyState = () => {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-4">
      {/* Added dark:text-slate-500 */}
      <div className="text-slate-400 dark:text-slate-500">{UI_ICONS.empty}</div>
      {/* Added dark:text-slate-200 */}
      <h2 className="mt-6 text-lg md:text-2xl font-semibold text-slate-700 dark:text-slate-200">
        No Devices Found
      </h2>
      {/* Added dark:text-slate-400 */}
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Your network view is currently empty.
      </p>
      {/* Added dark:text-slate-200 */}
      <p className="mt-2 text-slate-700 dark:text-slate-200 font-medium">
        Click the plus button below to add your first device.
      </p>
    </div>
  );
};

export default EmptyState;
