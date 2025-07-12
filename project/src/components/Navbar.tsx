import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Recycle, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onShowLogin: () => void;
  onShowRegister: () => void;
}

export default function Navbar({ onShowLogin, onShowRegister }: NavbarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Recycle className="w-8 h-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">ReWear</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-green-600 border-b-2 border-green-600 pb-1'
                      : 'text-gray-700 hover:text-green-600'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/browse"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/browse')
                      ? 'text-green-600 border-b-2 border-green-600 pb-1'
                      : 'text-gray-700 hover:text-green-600'
                  }`}
                >
                  Browse Items
                </Link>
                <Link
                  to="/add-item"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/add-item')
                      ? 'text-green-600 border-b-2 border-green-600 pb-1'
                      : 'text-gray-700 hover:text-green-600'
                  }`}
                >
                  Add Item
                </Link>
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.points} points</div>
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={onShowLogin}
                  className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={onShowRegister}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-gray-700 hover:text-green-600"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/browse"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Browse Items
                </Link>
                <Link
                  to="/add-item"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Add Item
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="px-3 py-2 text-sm text-gray-500">
                    {user.name} • {user.points} points
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onShowLogin();
                    setShowMobileMenu(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    onShowRegister();
                    setShowMobileMenu(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}