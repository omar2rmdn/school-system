import type { TimetableResource } from "../../types";

interface TimetableCardProps {
  timetable: TimetableResource;
  classTitle: string;
  onView: (timetable: TimetableResource) => void;
}

export const TimetableCard = ({ timetable, classTitle, onView }: TimetableCardProps) => {
  return (
    <tr>
      <td className="px-3 py-4 text-sm font-medium text-slate-900">
        {classTitle}
      </td>
      <td className="px-3 py-4">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onView(timetable)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View
          </button>
        </div>
      </td>
    </tr>
  );
};
