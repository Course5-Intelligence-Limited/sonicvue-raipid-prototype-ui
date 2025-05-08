"use client"

import { useContext } from "react"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import Layout from "./components/Layout"
import UploadPage from "./pages/UploadPage"
import Dashboard from "./pages/TryDashboard"
import ChatbotPage from "./pages/ChatbotPage"
import LoginPage from "./pages/LoginPage"
import { AuthProvider, AuthContext } from "./context/AuthContext"
import { Outlet } from "react-router-dom"
import { UploadProvider } from "./context/FileContext"
import TableData from "./pages/TableView"
import MyComponent from "./pages/HomePage"
import AgentPerformance from "./pages/AgentPerformance"
import PartsDispatch from "./pages/PartsDispatch"
import FieldVisitDashboard from "./pages/FieldVisit"

const theme = createTheme({
  palette: {
    primary: {
      main: "#6800E0", // Updated to match the login page
    },
  },
})

function AppContent() {
  const { isAuthenticated, logout, loading } = useContext(AuthContext)

  // Show loading indicator while checking authentication status
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/home" replace />} />
      {isAuthenticated && (
        <Route
          element={
            <UploadProvider>
              <Layout onLogout={logout}>
                <Outlet />
              </Layout>
            </UploadProvider>
          }
        >
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/home" element={<MyComponent />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/tableview" element={<TableData />} />
          <Route path="/agent" element={<AgentPerformance />} />
          <Route path="/parts" element={<PartsDispatch />} />
          <Route path="/field" element={<FieldVisitDashboard />} />
        </Route>
      )}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
