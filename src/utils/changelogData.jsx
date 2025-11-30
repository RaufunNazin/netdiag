import { UI_ICONS } from "./icons";

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
        icon: UI_ICONS.route,
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
        icon: UI_ICONS.check,
      },
    ],
  },
  {
    version: "1.1.0",
    date: "Oct 15, 2025",
    title: "Initial Release",
    features: [
      { text: "Network Diagram visualization launched.", icon: UI_ICONS.check },
    ],
  },
];
