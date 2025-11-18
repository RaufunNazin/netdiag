import { UI_ICONS } from "../../utils/icons";

const EditFab = ({ isEditing, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`z-10 p-3 rounded-full text-white transition-all duration-200
        ${
          isEditing
            ? "bg-green-500 hover:bg-green-600"
            : "bg-orange-400 hover:bg-orange-400"
        }`}
      title={isEditing ? "Save and Lock Layout" : "Enable Editing"}
    >
      {isEditing ? UI_ICONS.lock_main : UI_ICONS.edit_main}
    </button>
  );
};

export default EditFab;
