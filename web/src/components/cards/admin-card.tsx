import type { User } from "../../types";

interface AdminCardProps {
  admin: User;
  isCurrentAdmin: boolean;
  onEdit: (admin: User) => void;
  onDelete: (admin: User) => void;
}

export const AdminCard = ({ admin, isCurrentAdmin, onEdit, onDelete }: AdminCardProps) => {
  return (
    <tr>
      <td className="px-3 py-3 text-sm text-slate-700">
        <div className="flex items-center gap-2">
          <span>
            {admin.firstName} {admin.lastName}
          </span>
          {isCurrentAdmin ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              Me
            </span>
          ) : null}
        </div>
      </td>
      <td className="px-3 py-3 text-sm text-slate-700">
        {admin.role}
      </td>
      <td className="px-3 py-3 text-sm text-slate-700">
        {admin.email}
      </td>
      <td className="px-3 py-3 text-sm text-slate-700">
        {admin.phone}
      </td>
      <td className="px-3 py-3">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(admin)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit
          </button>
          {isCurrentAdmin ? null : (
            <button
              type="button"
              onClick={() => onDelete(admin)}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
