import { create } from "zustand";

type StudentStore = {
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
};

export const useStudentStore = create<StudentStore>((set) => ({
  selectedStudentId: null,
  setSelectedStudentId: (id) => set({ selectedStudentId: id }),
}));