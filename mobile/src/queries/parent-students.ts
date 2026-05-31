import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  class: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface StudentsResponse {
  message: string;
  data: {
    students: Student[];
  };
}

const getParentStudents = async (phone: string) => {
  const response = await api.get<StudentsResponse>(`/students/parent/${phone}`);
  return response.data.data.students;
};

export const useParentStudents = (phone: string) => {
  return useQuery({
    queryKey: ["students", "parent", phone],
    queryFn: () => getParentStudents(phone),
    enabled: !!phone,
  });
};
