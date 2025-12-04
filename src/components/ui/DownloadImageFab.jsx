import { UI_ICONS } from "../../utils/icons";

const DownloadImageFab = ({
  onClick,
  disabled,
  isDownloading,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isDownloading}
      // Added 'download-fab-btn' class
      className={`download-fab-btn relative z-20 p-3 rounded-full text-white bg-blue-500 hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${className}`}
      title="Export Diagram"
    >
      {isDownloading ? (
        // Spinner doesn't need the wrapper, it's already sized
        <div className="w-4 h-4 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        // Fixed size wrapper + icon class
        <div className="w-4 h-4 flex items-center justify-center icon-download">
          {UI_ICONS.download_main}
        </div>
      )}
    </button>
  );
};

export default DownloadImageFab;