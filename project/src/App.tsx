import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import BrowseItems from './pages/BrowseItems';
import AddItem from './pages/AddItem';
import ItemDetail from './pages/ItemDetail';
import AdminPanel from './pages/AdminPanel';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <AppContent />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar onShowLogin={() => setShowLogin(true)} onShowRegister={() => setShowRegister(true)} />
      
      <Routes>
        <Route path="/" element={<LandingPage onShowLogin={() => setShowLogin(true)} onShowRegister={() => setShowRegister(true)} />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/browse" element={user ? <BrowseItems /> : <Navigate to="/" />} />
        <Route path="/add-item" element={user ? <AddItem /> : <Navigate to="/" />} />
        <Route path="/item/:id" element={user ? <ItemDetail /> : <Navigate to="/" />} />
        <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
      </Routes>

      {showLogin && (
        <Login 
          onClose={() => setShowLogin(false)} 
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <Register 
          onClose={() => setShowRegister(false)} 
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}
    </>
  );
}

export default App;