const LoadingOverlay = () => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm transition-opacity duration-300">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-gray-700 tracking-wider">
        Loading Your Network Diagram...
      </p>
    </div>
  );
};

export default LoadingOverlay;
