import { Routes, Route } from "react-router-dom"
import { ToastProvider } from "./components/Toast.jsx"
import Layout from "./components/Layout.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Students from "./pages/Students.jsx"
import Attendance from "./pages/Attendance.jsx"
import Reports from "./pages/Reports.jsx"

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </ToastProvider>
  )
}
