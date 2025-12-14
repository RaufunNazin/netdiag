import { UI_ICONS } from "../../utils/icons";

const EditFab = ({ isEditing, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`edit-fab-btn z-10 p-3 rounded-full text-white transition-all duration-200 flex items-center justify-center
        ${
          isEditing
            ? "bg-green-500 hover:bg-green-600"
            : "bg-orange-400 hover:bg-orange-500"
        }`}
      title={isEditing ? "Save and Lock Layout [CTRL + S]/[E]" : "Enable Editing [E]"}
    >
      {/* FIX: Added 'w-6 h-6 flex items-center justify-center'.
         This creates a fixed bounding box. Even if the icon rotates 
         outside this box visually, the button size won't change.
      */}
      <div
        className={`w-4 h-4 flex items-center justify-center ${
          isEditing ? "icon-locking" : "icon-writing"
        }`}
      >
        {isEditing ? UI_ICONS.lock_main : UI_ICONS.edit_main}
      </div>
    </button>
  );
};

export default EditFab;
