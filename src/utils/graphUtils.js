import api from "../api";
import { toast } from "react-toastify";

// Fetches the detailed data for the modal
export const fetchNodeDetails = async (nodeId) => {
  try {
    // Assuming 'api' is your pre-configured axios instance
    const response = await api.get(`/node-details/${nodeId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch node details:", error);
    toast.error(
      error.response?.data?.detail || "Could not load device details."
    );
    throw error;
  }
};

// Saves the updated device and edge data
export const updateNodeDetails = async (nodeId, payload) => {
  try {
    const response = await api.put(`/node-details/${nodeId}`, payload);
    toast.success("Update successful!");
    return response.data;
  } catch (error) {
    console.error("Failed to update node details:", error);
    toast.error(
      error.response?.data?.detail || "An error occurred while saving."
    );
    throw error;
  }
};

export const fetchRootCandidates = async () => {
  try {
    const response = await api.get("/nodes/root-candidates");
    return response.data;
  } catch (error) {
    console.error("Error fetching root candidates:", error);
    toast.error(
      error.response?.data?.detail ||
        "Could not load the list of root devices to search."
    );
    throw error;
  }
};

export const fetchEdgeDetails = async (edgeId) => {
  try {
    const response = await api.get(`/edge/${edgeId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch edge details:", error);
    toast.error(
      error.response?.data?.detail || "Could not load cable details."
    );
    throw error;
  }
};

export const updateEdgeDetails = async (edgeId, payload, muted = false) => {
  try {
    const response = await api.put(`/edge/${edgeId}`, payload);
    if (!muted) {
      toast.success("Cable details updated!");
    }
    return response.data;
  } catch (error) {
    console.error("Failed to update edge details:", error);
    toast.error(
      error.response?.data?.detail || "An error occurred while saving."
    );
    throw error;
  }
};

export const saveNodePosition = async (nodeId, positionData, muted = false) => {
  // positionData should be { position_x, position_y, position_mode }
  const payload = {
    device_data: positionData,
    edges_to_update: [],
  };
  try {
    // We use the NEW endpoint here
    await api.put(`/node-details/${nodeId}`, payload);
    if (!muted) {
      toast.success("Position saved!");
    }
  } catch (error) {
    console.error("Error saving node position:", error);
    toast.error(
      error.response?.data?.detail || "An error occurred while saving position."
    );
    throw error;
  }
};

export const resetPositions = async (payload) => {
  try {
    const response = await api.post(`/positions/reset`, payload);
    if (response.status === 200) {
      toast.success("Positions reset!");
    } else {
      toast.error(response.data?.detail || "Failed to reset positions.");
    }
    return response.data;
  } catch (error) {
    console.error("Error resetting positions:", error);
    toast.error(
      error.response?.data?.detail ||
        "An error occurred while resetting positions."
    );
    throw error;
  }
};

export const insertNode = async (payload) => {
  try {
    const response = await api.post(`/node/insert`, payload);
    if (response.status === 201) {
      toast.success("Device inserted!");
    } else {
      toast.error(response.data?.detail || "Failed to insert device.");
    }
    return response.data;
  } catch (error) {
    console.error("Error inserting node:", error);
    toast.error(
      error.response?.data?.detail ||
        "An error occurred while inserting the device."
    );
    throw error;
  }
};

export const createNode = async (nodeData) => {
  try {
    // --- MODIFIED ---
    // Create a new object with only the device fields
    // The backend will soon reject edge fields on this endpoint
    const devicePayload = {
      name: nodeData.name,
      node_type: nodeData.node_type,
      sw_id: nodeData.sw_id,
      brand: nodeData.brand,
      model: nodeData.model,
      serial_no: nodeData.serial_no,
      mac: nodeData.mac,
      ip: nodeData.ip,
      split_ratio: nodeData.split_ratio,
      split_group: nodeData.split_group,
      vlan: nodeData.vlan,
      lat1: nodeData.lat1,
      long1: nodeData.long1,
      remarks: nodeData.remarks,
    };

    // The endpoint is the same, but the payload is now clean
    const response = await api.post(`/device`, devicePayload);
    // --- END MODIFICATION ---

    if (response.status === 201) {
      toast.success("Device created! Find it in the inventory drawer.");
    } else {
      toast.error(response.data?.detail || "Failed to create device.");
    }
    return response.data;
  } catch (error) {
    console.error("Error creating device:", error);
    toast.error(
      error.response?.data?.detail ||
        "An error occurred while creating the device."
    );
    throw error;
  }
};

// Add this function to graphUtils.js

export const createEdge = async (edgeData, muted = false) => {
  // edgeData should be { source, target }
  const payload = {
    source_id: parseInt(edgeData.source, 10),
    target_id: parseInt(edgeData.target, 10),
  };
  try {
    const response = await api.post(`/edge`, payload);
    if (!muted) {
      if (response.status === 201) {
        toast.success("Connection created!");
      } else {
        toast.error(response.data?.detail || "Failed to create connection");
      }
    }
  } catch (error) {
    console.error("Error creating connection:", error);
    if (!muted) {
      toast.error(
        error.response?.data?.detail ||
          "An error occurred while creating the connection."
      );
    }
    throw error;
  }
};

export const fetchData = async (swId) => {
  try {
    const url = swId ? `/data/${swId}` : "/data";
    const response = await api.get(url);

    return response.data;
  } catch (error) {
    console.error(`Error fetching data for SW_ID ${swId}:`, error);
    if (error.response && error.response.status === 404) {
      return [];
    }
    toast.error(
      error.response?.data?.detail || `Error fetching data for SW_ID ${swId}`
    );
    throw error;
  }
};

export const getDescendants = (nodeId, allNodes, allEdges) => {
  const hiddenNodeIds = new Set();
  const hiddenEdgeIds = new Set();
  const queue = [nodeId];
  const visited = new Set([nodeId]);

  while (queue.length > 0) {
    const currentId = queue.shift();
    const outgoingEdges = allEdges.filter((edge) => edge.source === currentId);

    for (const edge of outgoingEdges) {
      hiddenEdgeIds.add(edge.id);
      const targetId = edge.target;
      if (!visited.has(targetId)) {
        visited.add(targetId);
        hiddenNodeIds.add(targetId);
        queue.push(targetId);
      }
    }
  }

  return { hiddenNodeIds, hiddenEdgeIds };
};

export const deleteNode = async (deviceId, muted = false) => {
  try {
    const response = await api.delete(`/device/${deviceId}`); // <-- Changed URL
    if (!muted) {
      if (response.status === 200) {
        toast.success("Device and all its connections deleted!");
      } else {
        toast.error(response.data?.detail || "Failed to delete device.");
      }
    }
    return response.data;
  } catch (error) {
    console.error(`Error deleting node ${deviceId}:`, error); // <-- Changed logging
    if (!muted) {
      toast.error(
        error.response?.data?.detail ||
          "An error occurred while deleting the device."
      );
    }
    throw error;
  }
};

export const fetchOnuCustomerInfo = async (oltId, portName) => {
  try {
    const response = await api.get(`/onu/${oltId}/${portName}/customers`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching customer info for ${portName}:`, error);
    toast.error(
      error.response?.data?.detail || "Could not load customer info."
    );
    return [];
  }
};

export const deleteEdge = async (edgeId, muted = false) => {
  try {
    const response = await api.delete(`/edge/${edgeId}`); // <-- Changed URL

    if (!muted) {
      if (response.status === 200) {
        toast.success("Connection deleted!");
      } else {
        toast.error(response.data?.detail || "Failed to delete connection.");
      }
    }
    return response.data;
  } catch (error) {
    console.error(`Error deleting edge ${edgeId}:`, error); // <-- Changed logging
    if (!muted) {
      toast.error(
        error.response?.data?.detail ||
          "An error occurred while deleting the connection."
      );
    }
    throw error;
  }
};
