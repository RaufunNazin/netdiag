const GuidanceToast = ({ title, message, closeToast }) => {
  return (
    <div className="flex items-start" onClick={closeToast}>
      <div>
        <p className="font-bold text-neutral-800 dark:text-neutral-50">
          {title}
        </p>
        <div className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
          {message}
        </div>
      </div>
    </div>
  );
};

export default GuidanceToast;
