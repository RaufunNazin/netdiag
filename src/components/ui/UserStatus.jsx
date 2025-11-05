import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { UI_ICONS } from "../../utils/icons";

const UserStatus = () => {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser({ firstName: decodedToken.first_name || decodedToken.sub });
      } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login", {
      state: { message: "You have been logged out successfully." },
      replace: true,
    });
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 items-center p-2 rounded-lg bg-gray-100/10 hidden md:flex">
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-1.5">Logged in as</span>
          <span className="text-xs font-medium text-gray-700">
            {user.firstName}
          </span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="ml-3 text-gray-500 hover:text-[#ef4444] transition-colors"
          title="Logout"
        >
          {UI_ICONS.signOut}
        </button>
      </div>

      <div className="absolute bottom-16 left-2 z-20 flex items-center md:hidden rounded-lg bg-gray-100/10">
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-3 rounded-full text-white bg-[#ef4444] hover:bg-[#d43c3c] transition-all duration-200"
          title="Logout"
        >
          {UI_ICONS.signOut}
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 space-y-4">
            <h3 className="text-xl font-bold text-[#ef4444]">Confirm Logout</h3>
            <span className="text-gray-600">
              Are you sure you want to log out from
            </span>{" "}
            <span className="text-xs font-medium text-gray-700">
              {user.firstName}?
            </span>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#ef4444] text-white rounded-md hover:bg-[#d43c3c] transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserStatus;
