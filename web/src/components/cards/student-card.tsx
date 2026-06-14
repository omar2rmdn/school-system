import type { Student } from "../../types";

interface StudentCardProps {
  student: Student;
  classNameLabel: string;
  parentPhone: string;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export const StudentCard = ({ student, classNameLabel, parentPhone, onEdit, onDelete }: StudentCardProps) => {
  return (
    <tr>
      <td className="px-3 py-3 text-sm text-slate-700">
        {student.firstName}
      </td>
      <td className="px-3 py-3 text-sm text-slate-700">
        {student.lastName}
      </td>
      <td className="px-3 py-3 text-sm text-slate-700">
        {classNameLabel}
      </td>
      <td className="px-3 py-3 text-sm text-slate-700">
        {parentPhone}
      </td>
      <td className="px-3 py-3">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(student)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(student)}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};
