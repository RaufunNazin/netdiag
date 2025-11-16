import { useMemo } from "react";
import { UI_ICONS } from "../../utils/icons";

const IconBtn = ({ children, color, padding = "p-1" }) => {
  const colors = {
    blue: "bg-blue-500 text-white",
    green: "bg-green-500 text-white",
    red: "bg-red-500 text-white",
    gray: "bg-slate-200 text-slate-700",
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
  <>Want to move a whole branch? Drag its parent node.</>,
  <>
    Select multiple nodes by dragging a box in{" "}
    {
      <IconBtn color="blue" padding="p-1.5">
        {UI_ICONS.edit}
      </IconBtn>
    }{" "}
    Mode.
  </>,
  <>Move selected nodes together by dragging any one of them.</>,
  <>Right-click a node ➔ "Edit" to change its name or type.</>,
  <>Right-click a node ➔ "Send to Inventory" to disconnect it.</>,
  <>
    The{" "}
    {
      <IconBtn color="blue" padding="p-1.5">
        {UI_ICONS.edit}
      </IconBtn>
    }{" "}
    "Save" checkmark only appears if you've made changes.
  </>,
  <>No "Save" checkmark? No changes to save!</>,
  <>
    Connecting a node from inventory auto-enables{" "}
    {
      <IconBtn color="blue" padding="p-1.5">
        {UI_ICONS.edit}
      </IconBtn>
    }{" "}
    Mode.
  </>,
  <>You can't connect a node to itself.</>,
  <>Change a cable's color by editing the *child* node's properties.</>,
  <>
    The {<IconBtn color="blueTab">{UI_ICONS.chevronRight_main}</IconBtn>}{" "}
    inventory shows nodes with no connections.
  </>,
  <>
    Disconnecting a node will send it to the{" "}
    {<IconBtn color="blueTab">{UI_ICONS.chevronRight_main}</IconBtn>} inventory.
  </>,
  <>The inventory is your 'storage' for unused devices.</>,
  <>
    Can't find a device? Check the inventory tab{" "}
    {<IconBtn color="blueTab">{UI_ICONS.chevronRight_main}</IconBtn>}.
  </>,
  <>
    Devices in the{" "}
    {<IconBtn color="blueTab">{UI_ICONS.chevronRight_main}</IconBtn>} inventory
    are not visible on the map.
  </>,
  <>'OLT' is the start of your fiber network.</>,
  <>'PON' ports are children of an 'OLT'.</>,
  <>'Splitters' can branch one signal to many ONUs.</>,
  <>'TJs' (Transition Joints) connect different cable types.</>,
  <>'Routers' are often the main root of a non-fiber network.</>,
  <>'mSwitch' is a Managed Switch.</>,
  <>'uSwitch' is an Unmanaged Switch.</>,
  <>'AP' stands for Access Point.</>,
  <>'ONU' is the device at the customer's end.</>,
  <>The auto-layout tries to group all 'ONUs' in a grid.</>,
  <>
    In the customer popover,{" "}
    {<IconBtn color="gray">{UI_ICONS.lightbulb}</IconBtn>} shows customer online
    status.
  </>,
  <>
    In the popover, {<IconBtn color="gray">{UI_ICONS.unlock}</IconBtn>} means
    the customer's account is OK.
  </>,
  <>
    Customer status {<IconBtn color="gray">{UI_ICONS.lock}</IconBtn>} means
    'Locked'.
  </>,
  <>
    Customer status {<IconBtn color="gray">{UI_ICONS.clock}</IconBtn>} means
    'Expired'.
  </>,
  <>
    Customer status {<IconBtn color="gray">{UI_ICONS.timesCircle}</IconBtn>}{" "}
    means 'Disabled'.
  </>,
  <>The "User Status" box (top-left) shows who you're logged in as.</>,
  <>The diagram auto-saves calculated positions for new nodes.</>,
  <>Node positions are saved per-diagram (main view vs. OLT view).</>,
  <>The "MAC Found" time shows how recently an ONU was seen.</>,
  <>Your zoom level is saved in your browser, even after a refresh.</>,
  <>
    Can't connect? Make sure you're in{" "}
    {
      <IconBtn color="blue" padding="p-1.5">
        {UI_ICONS.edit}
      </IconBtn>
    }{" "}
    Mode!
  </>,
  <>
    Can't connect? A node can only have one {<IconBtn color="blueDot" />}{" "}
    (parent) connection.
  </>,
  <>
    Node disappeared? Check the{" "}
    {<IconBtn color="blueTab">{UI_ICONS.chevronRight_main}</IconBtn>} inventory.
  </>,
  <>Children disappeared? You may have disconnected their parent.</>,
  <>Accidentally reset? Don't worry, it only resets auto-layouted nodes.</>,
  <>Nodes you place manually will not be auto-reset.</>,
  <>
    The diagram is read-only by default. Click{" "}
    {
      <IconBtn color="blue" padding="p-1.5">
        {UI_ICONS.edit}
      </IconBtn>
    }{" "}
    to change it.
  </>,
  <>The app will auto-reload after you save changes.</>,
  <>
    Can't see a node you just added? Check the{" "}
    {<IconBtn color="blueTab">{UI_ICONS.chevronRight_main}</IconBtn>} inventory.
  </>,
  <>
    Buttons not working? Try exiting{" "}
    {
      <IconBtn color="blue" padding="p-1.5">
        {UI_ICONS.edit}
      </IconBtn>
    }{" "}
    Mode.
  </>,
  <>Start your network by adding a 'Router' or 'OLT'.</>,
  <>
    Use the {<IconBtn color="green">{UI_ICONS.add}</IconBtn>} button to create
    your first device.
  </>,
  <>
    The {<IconBtn color="green">{UI_ICONS.add}</IconBtn>} button is on the
    bottom dock.
  </>,
  <>
    The {<IconBtn color="blue">{UI_ICONS.expand}</IconBtn>} button (bottom dock)
    centers the diagram.
  </>,
  <>
    The{" "}
    {
      <IconBtn color="red" padding="p-1 rotate-90">
        {UI_ICONS.reset}
      </IconBtn>
    }{" "}
    button resets all auto-node positions.
  </>,
  <>
    The{" "}
    {
      <IconBtn color="red" padding="p-1 rotate-90">
        {UI_ICONS.reset}
      </IconBtn>
    }{" "}
    button is disabled in{" "}
    {
      <IconBtn color="blue" padding="p-1.5">
        {UI_ICONS.edit}
      </IconBtn>
    }{" "}
    Mode.
  </>,
  <>
    The {<IconBtn color="blue">{UI_ICONS.root}</IconBtn>} button (bottom dock)
    sets the main root device.
  </>,
  <>
    The {<IconBtn color="blue">{UI_ICONS.root}</IconBtn>} button only appears in
    the general view.
  </>,
  <>
    The {<IconBtn color="red">{UI_ICONS.undo}</IconBtn>} button is disabled if
    there are no changes to undo.
  </>,
  <>Your view is auto-saved! No need to save your zoom/pan.</>,
  <>
    Click the "Go Back" arrow{" "}
    {<IconBtn color="gray">{UI_ICONS.chevronLeft}</IconBtn>} (top left) to leave
    an OLT view.
  </>,
];

const LoadingOverlay = () => {
  const randomTip = useMemo(() => {
    const index = Math.floor(Math.random() * tips.length);
    return tips[index];
  }, []);

  return (
    <div className="absolute inset-0 p-2 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 gap-5">
      <div className="w-12 h-12 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
      <p className="text-lg md:text-2xl font-medium text-white text-center">
        Tip: {randomTip}
      </p>
    </div>
  );
};

export default LoadingOverlay;
