import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  X,
  LogOut,
  User
} from 'lucide-react';

const Sidebar = ({ open, setOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const adminMenu = [
    { name: 'Tableau de bord', href: '/admin', icon: Home },
    { name: 'Produits', href: '/admin/products', icon: Package },
    { name: 'Vendeurs', href: '/admin/sellers', icon: Users },
    { name: 'Ventes', href: '/admin/sales', icon: ShoppingCart },
    { name: 'Rapports', href: '/admin/reports', icon: BarChart3 },
  ];

  const sellerMenu = [
    { name: 'Tableau de bord', href: '/seller', icon: Home },
    { name: 'Produits', href: '/seller/products', icon: Package },
    { name: 'Ventes', href: '/seller/sales', icon: ShoppingCart },
  ];

  const menu = user?.role === 'admin' ? adminMenu : sellerMenu;

  const isActive = (href) => location.pathname === href;

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">SHAY BUSINESS</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center">
           <div className="w-8 h-8 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                <img
                  src={user?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name)}&background=random&size=64`}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4">
          <div className="space-y-2">
            {menu.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive(item.href)
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Déconnexion
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;