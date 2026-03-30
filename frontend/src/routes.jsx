import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import BookAppointment from "./pages/BookAppointment";
import DoctorAccess from "./pages/DoctorAccess";
import DoctorProfile from "./pages/DoctorProfile";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Recognition from "./pages/Recognition";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "book",
        element: <BookAppointment />,
      },
      {
        path: "recognition",
        element: <Recognition />,
      },
      {
        path: "doctors/:doctorId",
        element: <DoctorProfile />,
      },
      {
        path: "doctor-access",
        element: <DoctorAccess />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
