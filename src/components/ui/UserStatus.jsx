import { UI_ICONS } from "../../utils/icons";

const UserStatus = ({ user, onLogoutClick }) => {
  if (!user) {
    return null;
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 items-center p-2 rounded-lg bg-slate-100/10 hidden md:flex diagram-ui-overlay">
      <div className="flex items-center">
        <span className="text-xs text-slate-500 mr-1.5">Logged in as</span>
        <span className="text-xs font-medium text-slate-700">
          {user.firstName}
        </span>
      </div>
      <button
        onClick={onLogoutClick}
        className="ml-3 text-slate-500 hover:text-[#ef4444] transition-colors"
        title="Logout"
      >
        {UI_ICONS.signOut}
      </button>
    </div>
  );
};

export default UserStatus;
