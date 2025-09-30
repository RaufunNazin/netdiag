import api from "../api";
import { toast } from "react-toastify";

export const saveNodeInfo = async (updatedInfo) => {
  try {
    const response = await api
      .put(`/device`, updatedInfo)
      .catch((error) => {
        console.error("Failed to update node label:", error);
      });
    if (response.status === 200) {
      toast.success("Device update successful!");
    } else {
      toast.error("Failed to update device");
    }
  } catch (error) {
    console.error("Error saving device info:", error);
    throw error;
  }
};

export const createNode = async (nodeData) => {
  try {
    const response = await api.post(`/device`, nodeData);
    if (response.status === 201) {
      toast.success("Device created successfully!");
    } else {
      toast.error("Failed to create device.");
    }
    return response.data;
  } catch (error) {
    console.error("Error creating node:", error);
    toast.error(error.response?.data?.detail || "An error occurred while creating the device.");
    throw error;
  }
};

export const copyNodeInfo = async (sourceNodeId, newParentId) => {
  try {
    const payload = {
      source_node_id: parseInt(sourceNodeId, 10),
      new_parent_id: parseInt(newParentId, 10),
    };
    const response = await api.post(`/device/copy`, payload);
    if (response.status === 201) {
      toast.success("Connection update successful!");
    } else {
      toast.error("Failed to update connection");
    }
  } catch (error) {
    console.error("Error copying connection info:", error);
    throw error;
  }
};

// NEW function to fetch the OLT list
export const fetchOlts = async () => {
  try {
    const response = await api.get("/olts");
    return response.data;
  } catch (error) {
    console.error("Error fetching OLT list:", error);
    throw error;
  }
};

export const fetchData = async (swId) => {
  if (!swId) return []; // Don't fetch if no ID is provided
  try {
    const response = await api.get(`/data/${swId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for SW_ID ${swId}:`, error);
    // Return empty array on 404, otherwise throw
    if (error.response && error.response.status === 404) {
      return [];
    }
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

export const deleteNode = async (nodeInfo) => { // nodeInfo is now { name, sw_id }
  try {
    // For an axios.delete request with a body, it must be passed in a `data` object
    const response = await api.delete(`/node`, { data: nodeInfo });
    if (response.status === 200) {
      toast.success("Device and all its connections deleted successfully!");
    } else {
      toast.error("Failed to delete device.");
    }
    return response.data;
  } catch (error) {
    console.error(`Error deleting node ${nodeInfo.name}:`, error);
    toast.error("An error occurred while deleting the device.");
    throw error;
  }
};

export const deleteEdge = async (edgeInfo) => {
  try {
    const response = await api.delete(`/edge`, { data: edgeInfo });
    if (response.status === 200) {
      toast.success("Connection deleted successfully!");
    } else {
      toast.error("Failed to delete connection.");
    }
    return response.data; // Return data on success
  } catch (error) {
    console.error("Error deleting edge:", error);
    toast.error("An error occurred while deleting the connection.");
    throw error;
  }
};
