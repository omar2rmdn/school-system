import type { SubjectResource } from "../../types";

interface SubjectCardProps {
  resource: SubjectResource;
  onEdit: (resource: SubjectResource) => void;
  onDelete: (resource: SubjectResource) => void;
}

export const SubjectCard = ({ resource, onEdit, onDelete }: SubjectCardProps) => {
  return (
    <tr>
      <td className="px-3 py-3 text-sm text-slate-700">
        {resource.title}
      </td>
      <td className="px-3 py-3">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(resource)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(resource)}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};
