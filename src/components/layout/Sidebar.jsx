import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Package,
  Users,
  ShoppingCart,
  ShoppingBasket,
  BarChart3,
  X,
  LogOut,
  ChevronRight,
  User,
  Shield,
  Zap,
  Menu,
} from 'lucide-react';

const Sidebar = ({ open, setOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [notifications, setNotifications] = useState(3);
  const [darkMode, setDarkMode] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(2);

  // Menu configuration avec plus d'options
  const menuConfig = {
    admin: [
      { 
        name: 'Tableau de bord', 
        href: '/admin', 
        icon: Home,
        badge: null,
        description: 'Vue d\'ensemble'
      },
      { 
        name: 'Commandes', 
        href: '/seller', 
        icon: ShoppingBasket,
        description: 'Gérer les commandes'
      },
      { 
        name: 'Produits', 
        href: '/admin/products', 
        icon: Package,
        badge: null,
        description: 'Catalogue produits'
      },
      { 
        name: 'Vendeurs', 
        href: '/admin/sellers', 
        icon: Users,
        description: 'Gestion vendeurs'
      },
      { 
        name: 'Ventes', 
        href: '/admin/sales', 
        icon: ShoppingCart,
        description: 'Historique des ventes'
      },
      { 
        name: 'Analytics', 
        href: '/admin/reports', 
        icon: BarChart3,
        badge: 'Nouveau',
        description: 'Statistiques avancées'
      }
    ],
    seller: [
      { 
        name: 'Tableau de bord', 
        href: '/seller', 
        icon: Home,
        badge: null,
        description: 'Vue d\'ensemble'
      },
      { 
        name: 'Mes Produits', 
        href: '/seller/products', 
        icon: Package,
        description: 'Gérer mes produits'
      },
      { 
        name: 'Mes Ventes', 
        href: '/seller/sales', 
        icon: ShoppingCart,
        description: 'Voir mes ventes'
      }
    ]
  };

  const menu = menuConfig[user?.role] || menuConfig.seller;

  const isActive = (href) => location.pathname === href;

  const getRoleConfig = (role) => {
    const config = {
      admin: {
        gradient: 'from-purple-500 to-pink-500',
        icon: <Shield className="h-3 w-3" />,
        bgGradient: 'from-purple-500/20 to-pink-500/20',
        border: 'border-purple-500/30'
      },
      seller: {
        gradient: 'from-blue-500 to-cyan-500',
        icon: <User className="h-3 w-3" />,
        bgGradient: 'from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-500/30'
      }
    };
    return config[role] || config.seller;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const roleConfig = getRoleConfig(user?.role);

  return (
    <>
      {/* Mobile Overlay avec animation améliorée */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Container avec design amélioré */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl transform transition-all duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
        border-r border-slate-700/50
        hover:shadow-2xl
      `}>
        
        {/* Header avec effet glass amélioré */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-slow">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                SHAY BUSINESS
              </h1>
              <p className="text-xs text-slate-400 mt-1">Plateforme Professionnelle</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-300 hover:rotate-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile Section améliorée */}
        <div className="px-6 py-6 border-b border-slate-700/50 bg-slate-800/20 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl border-2 border-slate-600/50 overflow-hidden shadow-lg">
                <img
                  src={user?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name)}&background=0ea5e9&color=ffffff&size=64`}
                  alt="Profile"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-800 flex items-center justify-center bg-gradient-to-r ${roleConfig.gradient}`}>
                {roleConfig.icon}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-white truncate">{user?.name}</h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${roleConfig.gradient} text-white shadow-lg`}>
                  {user?.role}
                </div>
              </div>
              <p className="text-slate-400 text-sm truncate mb-2">{user?.email}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-slate-400">
                  <Zap className="h-3 w-3 text-green-400 animate-pulse" />
                  <span className="text-xs">En ligne</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu amélioré */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto max-h-[calc(100vh-320px)]">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActiveItem = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setOpen(false)}
                className={`
                  group relative flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:translate-x-1
                  ${isActiveItem
                    ? `bg-gradient-to-r ${roleConfig.bgGradient} text-white shadow-lg border ${roleConfig.border}`
                    : 'text-slate-300 hover:bg-slate-700/30 hover:text-white'
                  }
                `}
                title={item.description}
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    p-2 rounded-xl transition-all duration-300 shadow-lg
                    ${isActiveItem 
                      ? `bg-gradient-to-r ${roleConfig.gradient} text-white shadow-lg transform scale-110` 
                      : 'bg-slate-700/30 text-slate-400 group-hover:bg-slate-600/50 group-hover:text-white'
                    }
                  `}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{item.name}</span>
                    <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                      {item.description}
                    </span>
                  </div>
                </div>
                
                {/* Badge et indicateur améliorés */}
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-bold transition-all duration-300 min-w-6 text-center
                      ${isActiveItem
                        ? 'bg-white text-slate-900 shadow-lg'
                        : 'bg-primary-500/20 text-primary-300 group-hover:bg-primary-500/30 group-hover:text-primary-200'
                      }
                    `}>
                      {item.badge}
                    </span>
                  )}
                  {isActiveItem && (
                    <div className="w-2 h-2 bg-gradient-to-r from-primary-400 to-blue-400 rounded-full animate-pulse shadow-lg"></div>
                  )}
                </div>

                {/* Effets visuels améliorés */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className={`absolute left-0 w-1 h-6 rounded-r-full bg-gradient-to-b ${roleConfig.gradient} transition-all duration-300 ${
                  isActiveItem ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}></div>
              </Link>
            );
          })}
        </nav>

        {/* Footer avec Actions amélioré */}
        <div className="px-4 py-4 border-t border-slate-700/50 space-y-1">


          {/* Déconnexion */}
          <button
            onClick={handleLogout}
            className="group flex items-center w-full px-4 py-3 text-slate-300 rounded-2xl hover:bg-red-500/20 hover:text-red-300 transition-all duration-300 border border-transparent hover:border-red-500/30 hover:translate-x-1 mt-2"
          >
            <div className="p-2 rounded-xl bg-slate-700/30 text-slate-400 group-hover:bg-red-500/20 group-hover:text-red-300 transition-all duration-300 shadow-lg">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="ml-3 font-medium text-sm">Déconnexion</span>
            <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-1" />
          </button>

        </div>
      </div>

      {/* Mobile Menu Button amélioré */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 font-bold left-4 z-30 p-3 text-primary-900 shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-sm border border-white/10"
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  );
};

export default Sidebar;