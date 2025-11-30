import { UI_ICONS } from "./icons";

// ALWAYS add the newest release at the TOP of this array
export const APP_CHANGELOGS = [
  {
    version: "1.2.0",
    date: "Nov 30, 2025",
    title: "Path Tracing & Search Upgrades",
    features: [
      {
        text: (
          <span>
            <strong>New Path Tracing:</strong> Visualize connections between two
            devices. Supports <em>Direct</em> and <em>Neighboring</em> modes.
          </span>
        ),
        icon: UI_ICONS.route, // Reusing your existing icons
      },
      {
        text: (
          <span>
            <strong>Smart Search:</strong> Now supports searching by{" "}
            <strong>Customer ID</strong>, <strong>Username</strong> and{" "}
            <strong>MAC Address</strong> in addition to <em>device names</em>.
          </span>
        ),
        icon: UI_ICONS.search,
      },
      {
        text: "Performance improvements for large network graphs.",
        icon: UI_ICONS.check, // Assuming you have a check or generic icon
      },
    ],
  },
  // You can keep old versions here for history if you ever want a "See all changes" page
  {
    version: "1.1.0",
    date: "Oct 15, 2025",
    title: "Initial Release",
    features: [
      { text: "Network Diagram visualization launched.", icon: UI_ICONS.check },
    ],
  },
];
