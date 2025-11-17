export const ACTIONS = {
  EDIT_NODE: "editNode",
  RESET_POSITION: "resetPosition",
  DELETE_NODE: "deleteNode",
  INSERT_NODE: "insertNode",
  DELETE_EDGE: "deleteEdge",
  SEND_TO_INVENTORY: "sendToInventory",
  EDIT_EDGE: "editEdge",
};

export const CUST_STATUS = {
  OK: "OK",
  EXPIRED: "Expired",
  DISABLED: "Disabled",
  LOCKED: "Locked",
};

export const LABELS = {
  EDIT_DEVICE: "Edit Device",
  RESET_POSITION: "Reset Position",
  DELETE_DEVICE: "Delete Device",
  INSERT_DEVICE_ON_LINE: "Insert Device on Line",
  DELETE_CONNECTION: "Delete Connection",
  SEND_TO_INVENTORY: "Send to Inventory",
  VIEW_DETAILS: "View Details",
};

export const NODE_TYPES_ENUM = {
  OLT: "OLT",
  ONU: "ONU",
  SPLITTER: "Splitter",
  OTHER: "Other",
};

export const MISC = {
  DEVICE: "device",
  OTHER: "Other",
  STRING: "string",
  NUMERIC: "numeric",
  INPUT: "input",
  DEFAULT: "default",
  MANUAL: "manual",
  RIGHT: "right",
  LEFT: "left",
  NODE: "node",
  EDGE: "edge",
}
