const EditFab = ({ isEditing, onClick }) => {
  // Simple SVG icons for edit and lock
  const icons = {
    edit: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
      </svg>
    ),
    lock: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    ),
  };

  return (
    <button
      onClick={onClick}
      className={`absolute bottom-16 right-4 z-10 p-3 rounded-full shadow-lg text-white transition-colors
        ${
          isEditing
            ? "bg-green-500 hover:bg-green-600"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      title={isEditing ? "Save and Lock Layout" : "Enable Editing"}
    >
      {isEditing ? icons.lock : icons.edit}
    </button>
  );
};

export default EditFab;
