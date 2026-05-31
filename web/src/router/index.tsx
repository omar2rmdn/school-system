import { createBrowserRouter, RouterProvider } from "react-router";
import Login from "../pages/login";
import Unauthorized from "../pages/unauthorized";
import NotFound from "../pages/not-found";
import { Protected } from "../components/protected";
import Home from "../pages/home";
import MainLayout from "../layouts/main";
import Admins from "../pages/admins";
import Classes from "../pages/classes";
import Events from "../pages/events";
import Parents from "../pages/parents";
import Students from "../pages/students";
import Subjects from "../pages/subjects";
import Supervisors from "../pages/supervisors";
import Teachers from "../pages/teachers";
import Timetables from "../pages/timetables";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
  {
    element: <Protected allowedRoles={["admin"]} />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: "/classes",
            element: <Classes />,
          },
          {
            path: "/subjects",
            element: <Subjects />,
          },
          {
            path: "/students",
            element: <Students />,
          },
          {
            path: "/parents",
            element: <Parents />,
          },
          {
            path: "/teachers",
            element: <Teachers />,
          },
          {
            path: "/admins",
            element: <Admins />,
          },
          {
            path: "/supervisors",
            element: <Supervisors />,
          },
          {
            path: "/timetables",
            element: <Timetables />,
          },
          {
            path: "/events",
            element: <Events />,
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
