import mongoose from "mongoose";

interface ITimeSlot {
  startTime: string;
  endTime: string;
  subject?: mongoose.Types.ObjectId;
}

interface IDay {
  name: string;
  slots: ITimeSlot[];
}

interface ITable {
  name: string;
  days: IDay[];
  class: mongoose.Types.ObjectId;
}

const timeSlotSchema = new mongoose.Schema<ITimeSlot>({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
}, { _id: false });

const daySchema = new mongoose.Schema<IDay>({
  name: { type: String, required: true },
  slots: [timeSlotSchema],
}, { _id: false });

const tableSchema = new mongoose.Schema<ITable>({
  name: { type: String, required: true },
  days: [daySchema],
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
}, { timestamps: true });

const Table = mongoose.model("Table", tableSchema);

export { Table };