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
    const savedMode = localStorage.getItem("colorMode");
    if (savedMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

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
    <div className="flex items-center justify-center h-screen w-screen bg-neutral-50 dark:bg-neutral-950 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] transition-colors duration-200">
      <form
        onSubmit={handleLogin}
        className="p-4 md:p-8 bg-white/60 dark:bg-neutral-900/50 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-lg flex flex-col w-full max-w-sm transition-colors duration-200"
      >
        <h2 className="text-xl font-extrabold text-center text-neutral-800 dark:text-neutral-100">
          Network Diagram Login
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-center mb-6">
          Soon, a second login won't be necessary.
        </p>

        {error && (
          <p className="text-[#d43c3c] dark:text-red-400 text-center mb-6 font-medium">
            {error}
          </p>
        )}

        <div className="mb-5 flex flex-col">
          <label
            htmlFor="username"
            className="mb-2 font-semibold text-lg text-neutral-700 dark:text-neutral-300"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/50 dark:bg-neutral-900/50 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-500 transition-colors"
            placeholder="Enter your username"
          />
        </div>

        <div className="mb-8 flex flex-col relative">
          <label
            htmlFor="password"
            className="mb-2 font-semibold text-lg text-neutral-700 dark:text-neutral-300"
          >
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-3 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/50 dark:bg-neutral-900/50 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-500 pr-12 transition-colors"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[50px] text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 font-medium transition-colors"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="py-3 px-6 text-lg font-bold text-white bg-blue-600 rounded-lg shadow-md 
                     hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition duration-200 ease-in-out
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900
                     disabled:bg-neutral-400 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
