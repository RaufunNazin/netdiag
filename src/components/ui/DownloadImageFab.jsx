import { UI_ICONS } from "../../utils/icons";

/**
 * A FAB for triggering the download.
 * Shows a loading spinner when isDownloading is true.
 */
const DownloadImageFab = ({
  onClick,
  disabled,
  isDownloading,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      // Disable if explicitly disabled (e.g., loading page) OR if currently downloading
      disabled={disabled || isDownloading}
      className={`absolute bottom-16 left-2 md:left-4 z-20 p-3 rounded-full text-white bg-blue-500 hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title="Export Diagram"
    >
      {isDownloading ? (
        <>
          {/* Spinner Animation */}
          <div className="w-4 h-4 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
        </>
      ) : (
        UI_ICONS.download_main
      )}
    </button>
  );
};

export default DownloadImageFab;
