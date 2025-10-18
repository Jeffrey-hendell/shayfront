import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="ml-4 lg:ml-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
              <span className='hidden md:block text-primary-600'>Hello </span>&#160; {user?.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          
          {/* User avatar */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                <img
                  src={user?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name)}&background=random&size=64`}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;