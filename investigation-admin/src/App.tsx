import React from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import AdminLayout from "./layouts/AdminLayout"
import Dashboard from "./pages/Dashboard"
import Users from "./pages/Users"
import Moderation from "./pages/Moderation"
import Analytics from "./pages/Analytics"
import SystemSettings from "./pages/SystemSettings"
import Logs from "./pages/Logs"
import Login from "./pages/Login"

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="moderation" element={<Moderation />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="system" element={<SystemSettings />} />
        <Route path="logs" element={<Logs />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
