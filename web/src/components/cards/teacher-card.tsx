import type { User } from "../../types";

interface TeacherCardProps {
  teacher: User;
  classesLabel: string;
  subjectsLabel: string;
  onEdit: (teacher: User) => void;
  onDelete: (teacher: User) => void;
}

export const TeacherCard = ({ teacher, classesLabel, subjectsLabel, onEdit, onDelete }: TeacherCardProps) => {
  return (
    <tr>
      <td className="px-3 py-3 text-sm text-slate-700">
        {teacher.firstName} {teacher.lastName}
      </td>
      <td className="px-3 py-3 text-sm text-slate-700">
        {teacher.email}
      </td>
      <td className="px-3 py-3 text-sm text-slate-700">
        {teacher.phone}
      </td>
      <td className="px-3 py-3 text-sm text-slate-700">
        {classesLabel}
      </td>
      <td className="px-3 py-3 text-sm text-slate-700">
        {subjectsLabel}
      </td>
      <td className="px-3 py-3">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(teacher)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(teacher)}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};
