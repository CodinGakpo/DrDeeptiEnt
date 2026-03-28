import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import BookAppointment from "./pages/BookAppointment";
import DoctorProfile from "./pages/DoctorProfile";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

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
        path: "doctors/:doctorId",
        element: <DoctorProfile />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
