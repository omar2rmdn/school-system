import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE, useAuth } from "./AuthContext";

const AdminDataContext = createContext();

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminData must be used within AdminDataProvider");
  }
  return context;
};

export const AdminDataProvider = ({ children }) => {
  const { token, isLoading: authIsLoading } = useAuth();

  // State for all admin data
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [parents, setParents] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch classes data
  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/Classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.items || res.data.classes || res.data.data || [];
      setClasses(data);
    } catch (err) {
      console.error("AdminData - fetchClasses error:", err);
    }
  };

  // Fetch teachers data
  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/teachers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataRaw = Array.isArray(res.data)
        ? res.data
        : res.data.items || res.data.teachers || res.data.data || [];

      const teachersParsed = dataRaw.map((t) => ({
        id: t.id || t.teacherId,
        firstName: t.firstName || t.name?.split(" ")[0] || "",
        lastName: t.lastName || t.name?.split(" ").slice(1).join(" ") || "",
        email: t.email,
        nationalID: t.nationalID || t.nationalId,
        image: t.image || t.imageUrl,
        subjects: t.subjects || [],
      }));

      setTeachers(
        teachersParsed.sort((a, b) => {
          const nameA = `${a.firstName} ${a.lastName}`.trim().toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.trim().toLowerCase();
          return nameA.localeCompare(nameB);
        })
      );
    } catch (err) {
      console.error("AdminData - fetchTeachers error:", err);
    }
  };

  // Fetch students data
  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/Students`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { pageNumber: 1, pageSize: 1000 },
      });

      const data = res.data;
      const items = Array.isArray(data) ? data : data.items || data.data || [];

      const parsed = items.map((s) => ({
        id: s.id?.toString() ?? "",
        name: s.name,
        levelName: s.levelName,
        className: s.className,
        parentName: s.parentName,
        parentId: s.parentId,
        image: s.image
          ? `${API_BASE}/${s.image}`
          : "https://via.placeholder.com/100",
      }));

      setStudents(parsed.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error("AdminData - fetchStudents error:", err);
    }
  };

  // Fetch admins data
  const fetchAdmins = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/Users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items = Array.isArray(res.data)
        ? res.data
        : res.data.items || res.data.data || [];

      const adminOnly = items.filter(
        (u) => u.roles && u.roles.includes("Admin")
      );

      const parsed = adminOnly.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        name: `${u.firstName} ${u.lastName}`.trim(),
        email: u.email,
        nationalID: u.nationalID,
        image: u.image,
        isDisabled: u.isDisabled ?? false,
      }));

      setAdmins(
        parsed
          .filter((u) => !u.isDisabled)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (err) {
      console.error("AdminData - fetchAdmins error:", err);
    }
  };

  // Fetch parents data
  const fetchParents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/Users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          pageNumber: 1,
          pageSize: 1000,
          role: "Parent",
        },
      });

      const data = res.data;
      const items = Array.isArray(data) ? data : data.items || data.data || [];

      const parentsOnly = items.filter(
        (u) => u.roles && u.roles.includes("Parent")
      );

      setParents(
        parentsOnly
          .map((u) => ({
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            name: `${u.firstName} ${u.lastName}`.trim(),
            email: u.email,
            nationalID: u.nationalID,
            image:
              u.image && !u.image.startsWith("http")
                ? `${API_BASE}/${u.image}`
                : u.image,
            isDisabled: u.isDisabled ?? false,
          }))
          .filter((u) => !u.isDisabled)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (err) {
      console.error("AdminData - fetchParents error:", err);
    }
  };

  // Fetch supervisors data
  const fetchSupervisors = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/Users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          pageNumber: 1,
          pageSize: 1000,
          role: "Supervisor",
        },
      });

      const data = res.data;
      const items = Array.isArray(data) ? data : data.items || data.data || [];

      const supervisorsOnly = items.filter(
        (u) => u.roles && u.roles.includes("Supervisor")
      );

      setSupervisors(
        supervisorsOnly
          .map((u) => ({
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            name: `${u.firstName} ${u.lastName}`.trim(),
            email: u.email,
            nationalID: u.nationalID,
            image: u.image,
            isDisabled: u.isDisabled ?? false,
          }))
          .filter((u) => !u.isDisabled)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (err) {
      console.error("AdminData - fetchSupervisors error:", err);
    }
  };

  // Fetch events data
  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/Events`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;
      const items = Array.isArray(data) ? data : data.items || data.data || [];

      setEvents(
        items.map((e) => ({
          id: e.id.toString(),
          title: e.name,
          description: e.description,
          image: e.image
            ? `${API_BASE}/${e.image}`
            : "https://via.placeholder.com/150",
        }))
      );
    } catch (err) {
      console.error("AdminData - fetchEvents error:", err);
    }
  };

  // Fetch news data
  const fetchNews = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/news`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.items || res.data.news || res.data.data || [];
      const mapped = data.map((n) => ({
        ...n,
        title: n.title || n.Title || n.name,
        description: n.description,
        category: n.category || n.eventCategory,
        image:
          n.image && !n.image.startsWith("http")
            ? `${API_BASE}/${n.image}`
            : n.image || "https://via.placeholder.com/150",
      }));
      setNews(mapped);
    } catch (err) {
      console.error("AdminData - fetchNews error:", err);
    }
  };

  // Fetch subjects data
  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.items || res.data.subjects || res.data.data || [];
      setSubjects(data);
    } catch (err) {
      console.error("AdminData - fetchSubjects error:", err);
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    if (!token || authIsLoading) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      await Promise.all([
        fetchClasses(),
        fetchTeachers(),
        fetchStudents(),
        fetchAdmins(),
        fetchParents(),
        fetchSupervisors(),
        fetchEvents(),
        fetchNews(),
        fetchSubjects(),
      ]);
    } catch (err) {
      console.error("AdminData - fetchAllData error:", err);
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh all data
  const refreshAllData = async () => {
    setRefreshing(true);
    await fetchAllData();
  };

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [token, authIsLoading]);

  // Calculate counts
  const counts = {
    classes: classes.length,
    teachers: teachers.length,
    students: students.length,
    admins: admins.length,
    parents: parents.length,
    supervisors: supervisors.length,
    events: events.length,
    news: news.length,
    subjects: subjects.length,
  };

  const value = {
    // Data
    classes,
    teachers,
    students,
    admins,
    parents,
    supervisors,
    events,
    news,
    subjects,

    // Counts
    counts,

    // States
    loading,
    refreshing,
    error,

    // Actions
    refreshAllData,
    fetchAllData,
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};
