import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ReactFlowProvider } from "@xyflow/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import NetworkDiagram from "./pages/NetworkDiagram.jsx";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
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
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ReactFlowProvider>
                <ProtectedRoute />
              </ReactFlowProvider>
            }
          >
            <Route path="/" element={<NetworkDiagram />} />

            <Route path="/:id" element={<NetworkDiagram />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
