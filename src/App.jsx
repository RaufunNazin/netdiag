import React from "react";
import { ReactFlowProvider } from "reactflow";
import NetworkDiagram from "./pages/NetworkDiagram.jsx";

function App() {
  return (
    <ReactFlowProvider>
      <NetworkDiagram />
    </ReactFlowProvider>
  );
}

export default App;
