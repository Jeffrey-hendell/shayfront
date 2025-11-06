import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign,
  BarChart3,
  Download,
  FileText,
  Sparkles,
  Target,
  Award,
  Zap,
  ChevronRight,
  Eye,
  Calendar,
  Filter
} from 'lucide-react';
import { adminService, statsService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [sellerStats, setSellerStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('day');
  const [exportLoading, setExportLoading] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({});
  const [activeView, setActiveView] = useState('overview');

  // Animation des valeurs
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues({
        revenue: stats.stats?.total_revenue || 0,
        sales: stats.stats?.total_sales || 0,
        average: stats.stats?.average_sale || 0,
        sellers: sellerStats.seller_stats?.active_sellers || 0
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, [stats, sellerStats]);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const [salesStats, sellerPerformance] = await Promise.all([
        adminService.getStats(period),
        adminService.getSellerStats()
      ]);
      setStats(salesStats);
      setSellerStats(sellerPerformance);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const response = await adminService.exportExcel();
      const blob = new Blob([response], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport-ventes-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('📊 Rapport exporté avec succès');
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'export');
    } finally {
      setExportLoading(false);
    }
  };

  // Données pour les graphiques
  const salesData = sellerStats.daily_sales || [];
  const categoryData = sellerStats.category_distribution?.map(cat => ({
    name: cat.category,
    value: parseInt(cat.total_sold) || 0,
    revenue: parseFloat(cat.total_revenue) || 0,
    color: getCategoryColor(cat.category)
  })) || [];

  const topProducts = sellerStats.top_products || [];
  const sellerPerformance = sellerStats.seller_performance || [];

  // Fonction pour assigner des couleurs aux catégories
  function getCategoryColor(category) {
    const colors = {
      'maillot': '#0ea5e9',
      'jean': '#22c55e',
      'tennis': '#f59e0b',
      'sandale': '#ef4444',
      'accessoire': '#8b5cf6',
      'default': '#6b7280'
    };
    return colors[category?.toLowerCase()] || colors.default;
  }

  const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

  // Calcul des tendances
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 10 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const totalProductsSold = topProducts.reduce((sum, product) => 
    sum + (parseInt(product.total_quantity) || 0), 0) || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-slow">
                <img src="https://i.ibb.co/Lhbx4PKX/S-11-6-2025-1.png" alt="Shay" className='h-12 w-12'/>
              </div>
          <p className="text-gray-600 animate-pulse">Chargement des données...</p>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Gérer les produits',
      description: 'Ajouter, modifier ou supprimer des produits',
      icon: Package,
      href: '/admin/products',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br'
    },
    {
      title: 'Gérer les vendeurs',
      description: 'Créer ou désactiver des comptes vendeurs',
      icon: Users,
      href: '/admin/sellers',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-gradient-to-br'
    },
    {
      title: 'Voir les ventes',
      description: 'Consulter l\'historique des ventes',
      icon: ShoppingCart,
      href: '/admin/sales',
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-gradient-to-br'
    },
    {
      title: 'Rapports Détaillés',
      description: 'Analyses complètes et historiques',
      icon: BarChart3,
      href: '/admin/reports',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br'
    }
  ];

  const periodOptions = [
    { value: 'day', label: 'Aujourd\'hui', icon: Zap },
    { value: 'week', label: '7 derniers jours', icon: Calendar },
    { value: 'month', label: 'Ce mois', icon: TrendingUp },
    { value: 'year', label: 'Cette année', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header avec Navigation */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-primary-500 to-blue-500 rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Tableau de bord
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl">
              Aperçu en temps réel de votre activité commerciale et performances
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Navigation Views */}
            <div className="flex bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-gray-200/50">
              {['overview', 'analytics', 'reports'].map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    activeView === view 
                      ? 'bg-gradient-to-r from-primary-500 to-blue-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {view === 'overview' ? 'Vue globale' : 
                   view === 'analytics' ? 'Analytics' : 'Rapports'}
                </button>
              ))}
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleExportExcel}
                disabled={exportLoading}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50 transition-all duration-300 flex items-center shadow-md"
              >
                <Download className="h-4 w-4 mr-2" />
                {exportLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Excel'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Chiffre d'affaires"
            value={`${animatedValues.revenue || 0} GDS`}
            icon={DollarSign}
            trend={calculateTrend(stats.stats?.total_revenue || 0, 0)}
            trendDirection={stats.stats?.total_revenue > 0 ? "up" : "down"}
            color="primary"
            gradient="from-blue-500 to-cyan-500"
            animated
          />
          <StatCard
            title="Total des ventes"
            value={animatedValues.sales || 0}
            icon={ShoppingCart}
            trend={calculateTrend(stats.stats?.total_sales || 0, 0)}
            trendDirection={stats.stats?.total_sales > 0 ? "up" : "down"}
            color="success"
            gradient="from-green-500 to-emerald-500"
            animated
          />
          <StatCard
            title="Vente moyenne"
            value={`${Math.round(animatedValues.average || 0)} GDS`}
            icon={TrendingUp}
            trend={calculateTrend(stats.stats?.average_sale || 0, 0)}
            trendDirection={stats.stats?.average_sale > 0 ? "up" : "down"}
            color="warning"
            gradient="from-orange-500 to-amber-500"
            animated
          />
          <StatCard
            title="Vendeurs actifs"
            value={animatedValues.sellers || 0}
            icon={Users}
            trend={calculateTrend(sellerStats.seller_stats?.active_sellers || 0, 0)}
            trendDirection={sellerStats.seller_stats?.active_sellers > 0 ? "up" : "down"}
            color="danger"
            gradient="from-purple-500 to-pink-500"
            animated
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Sales Trend Chart */}
          <div className="xl:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-lg transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Évolution du chiffre d'affaires
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <TrendingUp className="h-4 w-4" />
                <span>Tendance {period}</span>
              </div>
            </div>
            <div className="h-80">
              {salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      className="text-sm"
                    />
                    <YAxis className="text-sm" />
                    <Tooltip 
                      formatter={(value) => [`${value} GDS`, 'Chiffre d\'affaires']}
                      labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString('fr-FR')}`}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total_amount" 
                      stroke="#0ea5e9" 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
                  <BarChart3 className="h-12 w-12 opacity-50" />
                  <p>Aucune donnée de vente disponible</p>
                </div>
              )}
            </div>
          </div>

          {/* Categories Distribution */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-lg transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Répartition par catégorie
              </h3>
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-80">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color || COLORS[index % COLORS.length]} 
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => {
                        if (name === 'value') return [`${value} unités`, 'Quantité vendue'];
                        return [value, name];
                      }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        border: 'none'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
                  <PieChart className="h-12 w-12 opacity-50" />
                  <p>Aucune donnée de catégorie disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Vendeurs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-lg transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Performance des vendeurs
              </h3>
              <div className="flex items-center space-x-2 text-primary-600">
                <Award className="h-5 w-5" />
                <span className="text-sm font-medium">Top {sellerPerformance.length}</span>
              </div>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {sellerPerformance.map((seller, index) => (
                <div 
                  key={seller.id} 
                  className="group flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50/50 rounded-xl border border-gray-200/50 hover:border-primary-300/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                      'bg-gradient-to-br from-primary-500 to-blue-500'
                    }`}>
                      <span className="text-white font-bold text-sm">
                        {index < 3 ? ['🥇', '🥈', '🥉'][index] : (index + 1)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {seller.name || 'Vendeur'}
                      </p>
                      <p className="text-sm text-gray-600">{seller.total_sales || 0} ventes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-primary-600">
                      {parseFloat(seller.total_revenue || 0).toFixed(2)} GDS
                    </p>
                    <p className="text-sm text-gray-500">
                      Moy: {parseFloat(seller.average_sale || 0).toFixed(2)} GDS
                    </p>
                  </div>
                </div>
              ))}
              {sellerPerformance.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune donnée de performance disponible</p>
                </div>
              )}
            </div>
          </div>

          {/* Produits les Plus Vendus */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-lg transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Produits populaires
              </h3>
              <div className="flex items-center space-x-2 text-orange-600">
                <Target className="h-5 w-5" />
                <span className="text-sm font-medium">Top {topProducts.length}</span>
              </div>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {topProducts.map((product, index) => (
                <div 
                  key={index} 
                  className="group flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50/50 rounded-xl border border-gray-200/50 hover:border-orange-300/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                        {product.name}
                      </p>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span className="capitalize bg-gray-100 px-2 py-1 rounded-full text-xs">
                          {product.category}
                        </span>
                        <span>{product.total_quantity} unités</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-orange-600">
                      {parseFloat(product.total_revenue || 0).toFixed(2)} GDS
                    </p>
                    <p className="text-sm text-gray-500">CA total</p>
                  </div>
                </div>
              ))}
              {topProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune donnée de produits disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Actions rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    to={action.href}
                    className="group block p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:shadow-xl transition-all duration-500 transform hover:scale-105"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl shadow-lg ${action.bgColor} ${action.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {action.title}
                          </h4>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Statistiques Résumées */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Aperçu global</h3>
            <div className="bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/20">
                  <span className="text-white/90">Performance globale</span>
                  <div className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                    {period}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Total produits:</span>
                    <span className="font-bold">{sellerStats.product_stats?.total_products || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Vendeurs actifs:</span>
                    <span className="font-bold text-emerald-200">
                      {sellerStats.seller_stats?.active_sellers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Stock total:</span>
                    <span className="font-bold">{sellerStats.product_stats?.total_stock || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Produits vendus:</span>
                    <span className="font-bold">{totalProductsSold}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/20">
                  <div className="flex justify-between items-center text-sm">
                    <span>Efficacité:</span>
                    <span className="font-bold text-emerald-200">
                      {totalProductsSold > 0 ? Math.round((totalProductsSold / (sellerStats.product_stats?.total_stock || 1)) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .bg-clip-text {
          -webkit-background-clip: text;
          background-clip: text;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
