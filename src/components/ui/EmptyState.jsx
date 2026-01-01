import { UI_ICONS } from "../../utils/icons";
const EmptyState = () => {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-4">
      <div className="text-neutral-400 dark:text-neutral-500">
        {UI_ICONS.empty}
      </div>
      <h2 className="mt-6 text-lg md:text-2xl font-semibold text-neutral-700 dark:text-neutral-200">
        No Devices Found
      </h2>
      <p className="mt-2 text-neutral-500 dark:text-neutral-400">
        Your network view is currently empty.
      </p>
      <p className="mt-2 text-neutral-700 dark:text-neutral-200 font-medium">
        Click the plus button below to add your first device.
      </p>
    </div>
  );
};

export default EmptyState;
