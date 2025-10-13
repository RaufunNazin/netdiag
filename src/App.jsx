import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import NetworkDiagram from "./pages/NetworkDiagram.jsx";

function App() {
  return (
    <Router>
      <ReactFlowProvider>
        <Routes>
          {/* General (full) network diagram */}
          <Route path="/" element={<NetworkDiagram />} />

          {/* Sub diagram for a specific OLT */}
          <Route path="/:id" element={<NetworkDiagram />} />
        </Routes>
      </ReactFlowProvider>
    </Router>
  );
}

export default App;
