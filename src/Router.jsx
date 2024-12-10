import React from "react"
import { HashRouter as Router, Route, Routes } from "react-router-dom"

import Home from "./pages/Home.jsx"
import Login from "./pages/Login.jsx"
import Settings from "./pages/Settings.jsx"
import ViewLogs from "./pages/ViewLogs.jsx"

export default function RouterComponent() {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/logs" element={<ViewLogs />} />
      </Routes>
    </Router>
  )
}
