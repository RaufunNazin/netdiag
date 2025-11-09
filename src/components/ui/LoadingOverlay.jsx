import { useMemo } from "react";
import { UI_ICONS } from "../../utils/icons";

const IconBtn = ({ children, color, padding = "p-1" }) => {
  const colors = {
    blue: "bg-blue-500 text-white",
    green: "bg-green-500 text-white",
    red: "bg-red-500 text-white",
    gray: "bg-gray-200 text-gray-700",
    blueTab: "bg-blue-500 text-white rounded-r-sm",
    orangeDot: "bg-orange-500",
    blueDot: "bg-blue-500",
  };

  if (color === "orangeDot" || color === "blueDot") {
    return (
      <span
        className={`inline-block w-3 h-3 rounded-full mx-1 align-middle ${colors[color]}`}
      />
    );
  }

  if (color === "blueTab") {
    return (
      <span
        className={`inline-flex items-center justify-center align-middle mx-1 px-0.5 py-1 ${colors[color]}`}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full align-middle mx-1 ${padding} ${colors[color]}`}
    >
      {children}
    </span>
  );
};

const tips = [
  <>Click-drag the canvas to pan.</>,
  <>Use your mouse wheel to zoom in and out.</>,
  <>On mobile, pinch to zoom.</>,
  <>On mobile, use two fingers to pan.</>,
  <>
    Lost? Click {<IconBtn color="blue">{UI_ICONS.expand}</IconBtn>} to reset
    your view.
  </>,
  <>
    Click {<IconBtn color="blueTab">{UI_ICONS.chevronRight_main}</IconBtn>} to
    open your inventory.
  </>,
  <>Drag-and-drop nodes from the inventory onto the diagram.</>,
  <>Use the Search Bar to find any device instantly.</>,
  <>Click a search result to fly directly to that node.</>,

  <>Click any node to collapse its children.</>,
  <>Click a collapsed node to expand it again.</>,
  <>
    Hover {<IconBtn color="gray">{UI_ICONS.info}</IconBtn>} on an ONU for
    customer data.
  </>,
  <>
    Click {<IconBtn color="gray">{UI_ICONS.info}</IconBtn>} on any node for its
    full details.
  </>,
  <>
    On mobile, tap {<IconBtn color="gray">{UI_ICONS.user}</IconBtn>} on an ONU
    for customer info.
  </>,
  <>
    Click {<IconBtn color="gray">{UI_ICONS.chevronRight}</IconBtn>} on an OLT to
    see its diagram.
  </>,
  <>A green border on an ONU means "Power On".</>,
  <>A red border on an ONU means "Power Off".</>,

  <>
    Click{" "}
    {
      <IconBtn color="blue" padding="p-1.5">
        {UI_ICONS.edit}
      </IconBtn>
    }{" "}
    to start editing.
  </>,
  <>
    Click{" "}
    {
      <IconBtn color="blue" padding="p-1.5">
        {UI_ICONS.edit}
      </IconBtn>
    }{" "}
    again to save or discard.
  </>,
  <>
    You can only move nodes in{" "}
    {
      <IconBtn color="blue" padding="p-1.5">
        {UI_ICONS.edit}
      </IconBtn>
    }{" "}
    Mode.
  </>,
  <>
    Draw connections only in{" "}
    {
      <IconBtn color="blue" padding="p-1.5">
        {UI_ICONS.edit}
      </IconBtn>
    }{" "}
    Mode.
  </>,
  <>
    In{" "}
    {
      <IconBtn color="blue" padding="p-1.5">
        {UI_ICONS.edit}
      </IconBtn>
    }{" "}
    Mode, right-click a node for options.
  </>,
  <>
    In{" "}
    {
      <IconBtn color="blue" padding="p-1.5">
        {UI_ICONS.edit}
      </IconBtn>
    }{" "}
    Mode, right-click an edge to delete.
  </>,
  <>
    In{" "}
    {
      <IconBtn color="blue" padding="p-1.5">
        {UI_ICONS.edit}
      </IconBtn>
    }{" "}
    Mode, right-click an edge to insert.
  </>,
  <>
    In{" "}
    {
      <IconBtn color="blue" padding="p-1.5">
        {UI_ICONS.edit}
      </IconBtn>
    }{" "}
    Mode, right-click the canvas to add.
  </>,
  <>
    Made a mistake? Click {<IconBtn color="red">{UI_ICONS.undo}</IconBtn>} to
    undo.
  </>,
  <>
    You can undo multiple steps in{" "}
    {
      <IconBtn color="blue" padding="p-1.5">
        {UI_ICONS.edit}
      </IconBtn>
    }{" "}
    Mode.
  </>,

  <>
    Connect {<IconBtn color="orangeDot" />} to {<IconBtn color="blueDot" />}.
  </>,
  <>
    You can't connect {<IconBtn color="blueDot" />} to{" "}
    {<IconBtn color="blueDot" />}.
  </>,
  <>
    You can't connect {<IconBtn color="orangeDot" />} to{" "}
    {<IconBtn color="orangeDot" />}.
  </>,
  <>{<IconBtn color="orangeDot" />} is an output (source).</>,
  <>{<IconBtn color="blueDot" />} is an input (target).</>,

  <>
    Click{" "}
    {
      <IconBtn color="red" padding="p-1 rotate-90">
        {UI_ICONS.reset}
      </IconBtn>
    }{" "}
    to reset node positions.
  </>,
  <>Right-click a node ➔ "Reset Position" to reset just one.</>,
  <>
    In the main view, click {<IconBtn color="blue">{UI_ICONS.root}</IconBtn>} to
    focus on one network.
  </>,
  <>
    Nodes you add go to the inventory{" "}
    {<IconBtn color="blueTab">{UI_ICONS.chevronRight_main}</IconBtn>} first.
  </>,
  <>
    Click {<IconBtn color="blue">{UI_ICONS.question}</IconBtn>} for a full list
    of tips.
  </>,
  <>Manually placed nodes won't be moved by the auto-layout.</>,
];

const LoadingOverlay = () => {
  const randomTip = useMemo(() => {
    const index = Math.floor(Math.random() * tips.length);
    return tips[index];
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm transition-opacity duration-300">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-gray-700 tracking-wider">
        Loading Your Network Diagram
      </p>

      <div className="mt-10 px-6 py-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm w-full max-w-md">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider text-center mb-2">
          Did you know?
        </p>
        <p className="text-lg font-medium text-gray-700 text-center">
          {randomTip}
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
