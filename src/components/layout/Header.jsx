import React, { useState, useEffect } from 'react';
import { Menu, Bell, Settings, LogOut, Search, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationCount, setNotificationCount] = useState();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Welcome Message */}
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
              <span className="hidden md:block bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Bonjour
              </span>
              <span className="md:ml-2">{user?.name}</span>
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              {formatDate(currentTime)} • {formatTime(currentTime)}
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">       

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
            >
              <div className="relative">
                <img
                  src={user?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name)}&background=random&size=64`}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border-2 border-transparent group-hover:border-primary-200 transition-all duration-200"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize flex items-center">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-1"></span>
                  {user?.role}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200/60 py-2 z-50 animate-in fade-in-0 zoom-in-95">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200/60">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-primary-600 capitalize mt-1">{user?.role}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 flex items-center">
                      <Settings className="h-4 w-4 mr-3" />
                      Paramètres du compte
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-200/60 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;