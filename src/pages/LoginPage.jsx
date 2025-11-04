import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const response = await api.post("/token", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("access_token", response.data.access_token);
      navigate("/");
    } catch (err) {
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 400)
      ) {
        setError("Incorrect username or password.");
      } else {
        setError("An error occurred. Please try again later.");
      }
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-50 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:16px_16px]">
      <form
        onSubmit={handleLogin}
        className="p-8 bg-white/10 backdrop-blur-sm border border-gray-200 shadow-xl rounded-lg flex flex-col w-full max-w-sm"
      >
        <h2 className="text-xl font-extrabold text-center text-gray-800">
          Network Diagram Login
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Soon, a second login won't be necessary.
        </p>

        {error && (
          <p className="text-[#d43c3c] text-center mb-6 font-medium">{error}</p>
        )}

        <div className="mb-5 flex flex-col">
          <label
            htmlFor="username"
            className="mb-2 font-semibold text-lg text-gray-700"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/50 text-gray-900 placeholder-gray-500"
            placeholder="Enter your username"
          />
        </div>

        <div className="mb-8 flex flex-col relative">
          <label
            htmlFor="password"
            className="mb-2 font-semibold text-lg text-gray-700"
          >
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/50 text-gray-900 placeholder-gray-500 pr-12"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[50px] text-gray-600 hover:text-gray-900 font-medium"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="py-3 px-6 text-lg font-bold text-white bg-blue-600 rounded-lg shadow-md 
                     hover:bg-blue-700 transition duration-300 ease-in-out
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white
                     disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
