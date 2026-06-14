import type { User } from "../../types";

interface SupervisorCardProps {
  supervisor: User;
  onEdit: (supervisor: User) => void;
  onDelete: (supervisor: User) => void;
}

export const SupervisorCard = ({ supervisor, onEdit, onDelete }: SupervisorCardProps) => {
  return (
    <tr>
      <td className="px-3 py-3 text-sm text-slate-700">
        {supervisor.firstName} {supervisor.lastName}
      </td>
      <td className="px-3 py-3 text-sm text-slate-700">
        {supervisor.role}
      </td>
      <td className="px-3 py-3 text-sm text-slate-700">
        {supervisor.email}
      </td>
      <td className="px-3 py-3 text-sm text-slate-700">
        {supervisor.phone}
      </td>
      <td className="px-3 py-3">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(supervisor)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(supervisor)}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};
