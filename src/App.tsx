import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import UploadPage from './pages/UploadPage';
import Dashboard from './pages/TryDashboard';
import ChatbotPage from './pages/ChatbotPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Outlet } from 'react-router-dom';
import CombinedDashboard from './pages/TableView';
import { UploadProvider } from './context/FileContext';
import TableData from './pages/TableView';
import HomePage from './pages/HomePage'
import MyComponent from './pages/HomePage';
import AgentPerformance from './pages/AgentPerformance';
import PartsDispatch from './pages/PartsDispatch';

const theme = createTheme({
  palette: {
    primary: {
      main: '#8e24aa',
    },
  },
});

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

function AppContent() {
  const { isAuthenticated, logout } = useContext(AuthContext);

  return (
    <Routes>
      <Route
        path="/login"
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/home" replace />}
      />
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
        </Route>
      )}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
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
  );
}

export default App;

