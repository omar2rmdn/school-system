import type { ClassResource } from "../../types";

interface ClassCardProps {
  resource: ClassResource;
  onEdit: (resource: ClassResource) => void;
  onDelete: (resource: ClassResource) => void;
}

export const ClassCard = ({ resource, onEdit, onDelete }: ClassCardProps) => {
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
