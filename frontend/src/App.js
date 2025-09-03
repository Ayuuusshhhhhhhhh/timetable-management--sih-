import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TimetableView from './pages/TimetableView';
import ClassroomManagement from './pages/ClassroomManagement';
import SubjectManagement from './pages/SubjectManagement';
import FacultyManagement from './pages/FacultyManagement';
import BatchManagement from './pages/BatchManagement';
import TimetableGeneration from './pages/TimetableGeneration';
import Layout from './components/Layout';

// Services
import authService from './services/authService';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.getProfile()
        .then(response => {
          setUser(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          {!user ? (
            <Routes>
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          ) : (
            <Layout user={user} onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Dashboard user={user} />} />
                <Route path="/timetable" element={<TimetableView user={user} />} />
                
                {user.role === 'admin' && (
                  <>
                    <Route path="/classrooms" element={<ClassroomManagement />} />
                    <Route path="/subjects" element={<SubjectManagement />} />
                    <Route path="/faculty" element={<FacultyManagement />} />
                    <Route path="/batches" element={<BatchManagement />} />
                    <Route path="/generate" element={<TimetableGeneration />} />
                  </>
                )}
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          )}
          <ToastContainer position="top-right" />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
