const GuidanceToast = ({ title, message, closeToast }) => {
  return (
    <div className="flex items-start" onClick={closeToast}>
      <div>
        {/* Added dark:text-slate-100 */}
        <p className="font-bold text-slate-800 dark:text-slate-100">{title}</p>
        {/* Added dark:text-slate-300 */}
        <div className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
          {message}
        </div>
      </div>
    </div>
  );
};

export default GuidanceToast;
