import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { FaSignOutAlt } from "react-icons/fa";

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
        // If token is invalid, log the user out without a message
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    // 1. Pass a message in the navigation state to the login page
    // 2. 'replace: true' prevents the user from going back to the authenticated page
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
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center p-2 rounded-lg bg-gray-100/10">
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
          <FaSignOutAlt />
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 space-y-4">
            <h3 className="text-xl font-bold text-[#ef4444]">Confirm Logout</h3>
            <p className="text-gray-600">Are you sure you want to log out?</p>
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
