import { UI_ICONS } from "../../utils/icons";
const EmptyState = () => {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-4">
      {/* Added dark:text-neutral-500 */}
      <div className="text-neutral-400 dark:text-neutral-500">
        {UI_ICONS.empty}
      </div>
      {/* Added dark:text-neutral-200 */}
      <h2 className="mt-6 text-lg md:text-2xl font-semibold text-neutral-700 dark:text-neutral-200">
        No Devices Found
      </h2>
      {/* Added dark:text-neutral-400 */}
      <p className="mt-2 text-neutral-500 dark:text-neutral-400">
        Your network view is currently empty.
      </p>
      {/* Added dark:text-neutral-200 */}
      <p className="mt-2 text-neutral-700 dark:text-neutral-200 font-medium">
        Click the plus button below to add your first device.
      </p>
    </div>
  );
};

export default EmptyState;
