const LINK_TYPES = ["Fiber Optic", "UTP"];
const NODE_TYPES = [
  "",
  "AP",
  "Bamboo",
  "mSwitch",
  "OLT",
  "ONU",
  "PON",
  "Router",
  "Splitter",
  "TJ",
  "uSwitch",
  "Other",
];

const DEVICE_TYPES = ["EPON", "GPON", "XPON"];

const CORE_COLORS_DATA = [
  { name: "Blue", hex: "#3b82f6", text: "text-white" },
  { name: "Orange", hex: "#f97316", text: "text-white" },
  { name: "Green", hex: "#22c55e", text: "text-white" },
  { name: "Brown", hex: "#a16207", text: "text-white" },
  { name: "Slate", hex: "#64748b", text: "text-white" },
  { name: "White", hex: "#f8fafc", text: "text-neutral-800" },
  { name: "Red", hex: "#ef4444", text: "text-white" },
  { name: "Black", hex: "#1e293b", text: "text-white" },
  { name: "Yellow", hex: "#facc15", text: "text-neutral-800" },
  { name: "Violet", hex: "#8b5cf6", text: "text-white" },
  { name: "Rose", hex: "#f43f5e", text: "text-white" },
  { name: "Aqua", hex: "#22d3ee", text: "text-neutral-800" },
];
const SPLIT_RATIOS = ["", "2", "4", "8", "16", "32", "64"];

export { LINK_TYPES, NODE_TYPES, DEVICE_TYPES, CORE_COLORS_DATA, SPLIT_RATIOS };

export const nodeColors = {
  AP:        "#93c5fd", // soft sky blue
  Bamboo:    "#a7f3d0", // soft mint green
  mSwitch:   "#c4b5fd", // soft violet
  OLT:       "#fca5a5", // soft red
  ONU:       "#6ee7b7", // soft emerald
  PON:       "#fde68a", // soft amber
  Router:    "#fdba74", // soft orange
  Splitter:  "#bfdbfe", // soft blue
  TJ:        "#e9d5ff", // soft lavender
  uSwitch:   "#ddd6fe", // soft indigo
  Other:     "#e5e7eb", // neutral gray
};
