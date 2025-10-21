const GuidanceToast = ({ title, message, closeToast }) => {
  return (
    <div className="flex items-start" onClick={closeToast}>
      <div>
        <p className="font-bold text-gray-800">{title}</p>
        <p
          className="text-sm text-gray-600"
          dangerouslySetInnerHTML={{ __html: message }}
        />
      </div>
    </div>
  );
};

export default GuidanceToast;
