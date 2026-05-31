import type { DaySlot, TimetableFormModalProps } from "./types";
import { timetableDays } from "./constants";

export default function TimetableFormModal({
  mode,
  values,
  classOptions,
  subjectOptions,
  errorMessage,
  isSubmitting,
  isOptionsLoading,
  onChange,
  onClose,
  onSubmit,
}: TimetableFormModalProps) {
  const heading = mode === "create" ? "Add Timetable" : "Edit Timetable";
  const submitLabel = mode === "create" ? "Create" : "Save Changes";

  function handleDaySlotChange(index: number, key: keyof DaySlot, value: string) {
    const newDays = [...values.days];
    newDays[index] = { ...newDays[index], [key]: value };
    onChange("days", newDays);
  }

  function addDaySlot() {
    onChange("days", [...values.days, { day: "Sunday", startTime: "", endTime: "", subject: "" }]);
  }

  function removeDaySlot(index: number) {
    if (values.days.length > 1) {
      onChange("days", values.days.filter((_, i) => i !== index));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">{heading}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter the timetable details.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            Close
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-6">
          <div className="max-w-xs">
            <label
              htmlFor="timetable-class"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Class
            </label>
            <select
              id="timetable-class"
              value={values.class}
              onChange={(event) => onChange("class", event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="">Select a class</option>
              {classOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-700">Day Slots</h3>
              <button
                type="button"
                onClick={addDaySlot}
                className="text-sm font-medium text-slate-950 hover:underline"
              >
                + Add Slot
              </button>
            </div>
            {values.days.map((slot, index) => (
              <div key={index} className="grid gap-4 sm:grid-cols-4 items-end rounded-xl border border-slate-200 p-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-700">Day</label>
                  <select
                    value={slot.day}
                    onChange={(e) => handleDaySlotChange(index, "day", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  >
                    {timetableDays.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-700">Subject</label>
                  <select
                    value={slot.subject}
                    onChange={(e) => handleDaySlotChange(index, "subject", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  >
                    <option value="">Select</option>
                    {subjectOptions.map((option) => (
                      <option key={option.id} value={option.id}>{option.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-700">Start Time</label>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => handleDaySlotChange(index, "startTime", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="mb-2 block text-xs font-medium text-slate-700">End Time</label>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => handleDaySlotChange(index, "endTime", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    />
                  </div>
                  {values.days.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeDaySlot(index)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-slate-500">
            {isOptionsLoading ? "Loading classes and subjects..." : ""}
          </p>

          {errorMessage ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isOptionsLoading}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
