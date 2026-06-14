import type { User } from "../../types";

interface ParentCardProps {
  parent: User;
  onEdit: (parent: User) => void;
  onDelete: (parent: User) => void;
}

export const ParentCard = ({ parent, onEdit, onDelete }: ParentCardProps) => {
  return (
    <tr>
      <td className="px-3 py-3 text-sm text-slate-700">
        {parent.firstName} {parent.lastName}
      </td>
      <td className="px-3 py-3 text-sm text-slate-700">
        {parent.role}
      </td>
      <td className="px-3 py-3 text-sm text-slate-700">
        {parent.email}
      </td>
      <td className="px-3 py-3 text-sm text-slate-700">
        {parent.phone}
      </td>
      <td className="px-3 py-3">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(parent)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(parent)}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};
