import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import your page and layout components
import NetworkDiagram from "./pages/NetworkDiagram.jsx";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      {/* ToastContainer for notifications across the app */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Router>
        <Routes>
          {/* Public Route: Anyone can access the login page */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes:
            The ProtectedRoute component will check for a token.
            If a token exists, it will render the child route (NetworkDiagram).
            If not, it will redirect the user to "/login".
            ReactFlowProvider wraps these routes to provide the necessary context.
          */}
          <Route
            element={
              <ReactFlowProvider>
                <ProtectedRoute />
              </ReactFlowProvider>
            }
          >
            {/* General (full) network diagram */}
            <Route path="/" element={<NetworkDiagram />} />

            {/* Sub diagram for a specific OLT */}
            <Route path="/:id" element={<NetworkDiagram />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
