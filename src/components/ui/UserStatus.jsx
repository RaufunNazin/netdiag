import { UI_ICONS } from "../../utils/icons";

const UserStatus = ({ user, onLogoutClick }) => {
  if (!user) {
    return null;
  }

  return (
    <div
      // Added dark:bg-slate-800/30
      className="absolute top-4 left-1/2 -translate-x-1/2 z-20 items-center p-2 rounded-lg bg-slate-100/50 dark:bg-slate-800/30 hidden md:flex diagram-ui-overlay backdrop-blur-[2px]"
    >
      <div className="flex items-center">
        {/* Added dark:text-slate-400 */}
        <span className="text-xs text-slate-500 dark:text-slate-400 mr-1.5">
          Logged in as
        </span>
        {/* Added dark:text-slate-200 */}
        <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
          {user.firstName}
        </span>
      </div>
      <button
        onClick={onLogoutClick}
        // Added dark:text-slate-400 and dark:hover:text-red-400
        className="ml-3 text-slate-500 hover:text-[#ef4444] dark:text-slate-400 dark:hover:text-red-400 transition-colors"
        title="Logout"
      >
        {UI_ICONS.signOut}
      </button>
    </div>
  );
};

export default UserStatus;
