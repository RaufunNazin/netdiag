import api from "../api";
import { toast } from "react-toastify";

export const fetchRootCandidates = async () => {
  try {
    const response = await api.get("/nodes/root-candidates");
    return response.data;
  } catch (error) {
    console.error("Error fetching root candidates:", error);
    toast.error("Could not load the list of root devices to search.");
    throw error;
  }
};

export const saveNodeInfo = async (updatedInfo, muted = false) => {
  try {
    const response = await api.put(`/device`, updatedInfo).catch((error) => {
      console.error("Failed to update node label:", error);
    });
    if (!muted) {
      if (response.status === 200) {
        toast.success("Device update successful!");
      } else {
        toast.error("Failed to update device");
      }
    }
  } catch (error) {
    console.error("Error saving device info:", error);
    throw error;
  }
};

export const resetPositions = async (payload) => {
  try {
    const response = await api.post(`/positions/reset`, payload);
    if (response.status === 200) {
      toast.success("Positions reset successfully!");
    } else {
      toast.error("Failed to reset positions.");
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
      toast.success("Device inserted successfully!");
    } else {
      toast.error("Failed to insert device.");
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
    const response = await api.post(`/device`, nodeData);
    if (response.status === 201) {
      toast.success("Device created successfully!");
    } else {
      toast.error("Failed to create device.");
    }
    return response.data;
  } catch (error) {
    console.error("Error creating node:", error);
    toast.error(
      error.response?.data?.detail ||
        "An error occurred while creating the device."
    );
    throw error;
  }
};

export const copyNodeInfo = async (
  sourceNodeId,
  newParentId,
  muted = false
) => {
  try {
    const payload = {
      source_node_id: parseInt(sourceNodeId, 10),
      new_parent_id: parseInt(newParentId, 10),
    };
    const response = await api.post(`/device/copy`, payload);

    // Wrap toast in !muted check
    if (!muted) {
      if (response.status === 201) {
        toast.success("Connection update successful!");
      } else {
        toast.error("Failed to update connection");
      }
    }
  } catch (error) {
    console.error("Error copying connection info:", error);
    // Wrap toast in !muted check
    if (!muted) {
      toast.error(
        error.response?.data?.detail ||
          "An error occurred while copying connection info."
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

export const deleteNode = async (nodeInfo, muted = false) => {
  try {
    const response = await api.delete(`/node`, { data: nodeInfo });
    if (!muted) {
      // Add this check
      if (response.status === 200) {
        toast.success("Device and all its connections deleted successfully!");
      } else {
        toast.error("Failed to delete device.");
      }
    }
    return response.data;
  } catch (error) {
    console.error(`Error deleting node ${nodeInfo.name}:`, error);
    if (!muted) {
      // Add this check
      toast.error("An error occurred while deleting the device.");
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
    return [];
  }
};

export const deleteEdge = async (edgeInfo, muted = false) => {
  try {
    const response = await api.delete(`/edge`, { data: edgeInfo });

    // Wrap toast in !muted check
    if (!muted) {
      if (response.status === 200) {
        toast.success("Connection deleted successfully!");
      } else {
        toast.error("Failed to delete connection.");
      }
    }
    return response.data;
  } catch (error) {
    console.error("Error deleting edge:", error);
    // Wrap toast in !muted check
    if (!muted) {
      toast.error("An error occurred while deleting the connection.");
    }
    throw error;
  }
};
