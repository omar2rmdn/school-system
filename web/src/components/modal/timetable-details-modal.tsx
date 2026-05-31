import { useState } from "react";
import { getRelatedTitle } from "../timetables/helpers";
import { timetableDays } from "../../consts/index";
import type { TimetableDay, TimetableDetailsModalProps } from "../../types";

export default function TimetableDetailsModal({
  timetable,
  classTitle,
  subjectLabelMap,
  onClose,
  onEdit,
  onDelete,
}: TimetableDetailsModalProps) {
  const slotsByDay = timetableDays.map((day) => ({
    day,
    slots: timetable.days.filter((slot) => slot.day === day),
  }));
  const [openDays, setOpenDays] = useState<TimetableDay[]>([]);

  function toggleDay(day: TimetableDay) {
    setOpenDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day],
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Class timetable</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                {classTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              Close
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {slotsByDay.map(({ day, slots }) => (
              <div
                key={day}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50"
              >
                <button
                  type="button"
                  onClick={() => toggleDay(day)}
                  className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-slate-100/80"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {day}
                    </h3>
                  </div>
                  <span className="text-sm font-medium text-slate-500">
                    {openDays.includes(day) ? "Hide" : "Show"}
                  </span>
                </button>

                {openDays.includes(day) ? (
                  <div className="border-t border-slate-200 px-4 py-4">
                    {slots.length === 0 ? (
                      <p className="text-sm text-slate-400">
                        No slots scheduled.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {slots.map((slot, index) => (
                          <div
                            key={`${slot.day}-${slot.startTime}-${index}`}
                            className="rounded-xl border border-slate-200 bg-white p-3"
                          >
                            <p className="text-sm font-medium text-slate-900">
                              {getRelatedTitle(slot.subject, subjectLabelMap)}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {slot.startTime} - {slot.endTime}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onDelete}
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Edit Timetable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
