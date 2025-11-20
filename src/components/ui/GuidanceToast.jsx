const GuidanceToast = ({ title, message, closeToast }) => {
  return (
    <div className="flex items-start" onClick={closeToast}>
      <div>
        <p className="font-bold text-slate-800">{title}</p>
        <div className="text-sm text-slate-600 mt-1 leading-relaxed">
          {message}
        </div>
      </div>
    </div>
  );
};

export default GuidanceToast;
