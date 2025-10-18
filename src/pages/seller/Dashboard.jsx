import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp,
  DollarSign,
  Plus,
  Users,
  ArrowUp,
  ArrowDown,
  Calendar,
  RefreshCw,
  Sparkles,
  Target,
  BarChart3,
  Zap
} from 'lucide-react';
import { saleService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import QuickSale from '../../components/seller/QuickSale';

const SellerDashboard = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showQuickSale, setShowQuickSale] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setRefreshing(true);
      const data = await saleService.getMySales();
      setSales(data);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getFilteredSales = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'today':
        return sales.filter(sale => 
          new Date(sale.created_at).toDateString() === now.toDateString()
        );
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        return sales.filter(sale => new Date(sale.created_at) >= weekAgo);
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        return sales.filter(sale => new Date(sale.created_at) >= monthAgo);
      default:
        return sales;
    }
  };

  const filteredSales = getFilteredSales();
  const todaySales = sales.filter(sale => 
    new Date(sale.created_at).toDateString() === new Date().toDateString()
  );

  const todayRevenue = todaySales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
  const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
  const averageSale = sales.length > 0 ? totalRevenue / sales.length : 0;

  const stats = [
    {
      title: "Ventes aujourd'hui",
      value: todaySales.length.toString(),
      change: "+12%",
      trend: "up",
      icon: ShoppingCart,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      description: "vs hier"
    },
    {
      title: "CA aujourd'hui",
      value: `${todayRevenue.toLocaleString('fr-FR')} GDS`,
      change: "+8.2%",
      trend: "up",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      description: "vs hier"
    },
    {
      title: "Ventes totales",
      value: sales.length.toString(),
      change: "+15.7%",
      trend: "up",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      description: "ce mois"
    },
    {
      title: "Panier moyen",
      value: `${averageSale.toFixed(0)} GDS`,
      change: "+5.3%",
      trend: "up",
      icon: Target,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
      description: "vs mois dernier"
    }
  ];

  const quickActions = [
    {
      title: 'Vente Rapide',
      description: 'Nouvelle vente en 1 clic',
      icon: Zap,
      onClick: () => setShowQuickSale(true),
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      buttonText: 'Démarrer'
    },
    {
      title: 'Catalogue Produits',
      description: 'Gérer votre inventaire',
      icon: Package,
      href: '/seller/products',
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      buttonText: 'Voir'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec gradient */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Sparkles className="h-8 w-8 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Tableau de Bord</h1>
              <p className="text-slate-300 mt-1 text-[10px] sm:text-base">
                Vue d'ensemble de votre activité commerciale
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              onClick={loadSales}
              disabled={refreshing}
              className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowQuickSale(true)}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouvelle Vente
            </button>
          </div>
        </div>
      </div>

      {/* Filtres de période */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 hidden sm:block">Performance des Ventes</h2>
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl">
          {['today', 'week', 'month', 'all'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedPeriod === period
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period === 'today' && "Aujourd'hui"}
              {period === 'week' && "Cette semaine"}
              {period === 'month' && "Ce mois"}
              {period === 'all' && "Tout"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de statistiques moderne */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`flex items-center text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUp className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 mr-1" />
                      )}
                      {stat.change}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">{stat.description}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Actions rapides */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Zap className="h-5 w-5 text-yellow-500 mr-2" />
              Actions Rapides
            </h3>
            <div className="space-y-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const content = (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${action.color} text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{action.title}</h4>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-white text-gray-700 rounded-lg text-sm font-medium group-hover:shadow-md transition-all duration-200">
                      {action.buttonText}
                    </span>
                  </div>
                );

                return action.href ? (
                  <Link key={index} to={action.href}>
                    {content}
                  </Link>
                ) : (
                  <button key={index} onClick={action.onClick} className="w-full text-left">
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ventes récentes */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ShoppingCart className="h-5 w-5 text-blue-500 mr-2" />
                Ventes Récentes
              </h3>
              <Link 
                to="/seller/sales" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
              >
                Voir tout
                <ArrowUp className="h-4 w-4 ml-1 transform rotate-45" />
              </Link>
            </div>

            <div className="space-y-4">
              {filteredSales.slice(0, 6).map((sale, index) => (
                <div 
                  key={sale.id} 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-semibold">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Facture #{sale.invoice_number}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600">{sale.customer_name || 'Client non renseigné'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold sm:text-lg text-gray-900 text-xs">{sale.total_amount} GDS</p>
                    <div className="flex items-center space-x-1 text-gray-500 text-sm mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(sale.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredSales.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Aucune vente pour cette période</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Commencez par enregistrer votre première vente
                  </p>
                  <button
                    onClick={() => setShowQuickSale(true)}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Créer une vente
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Sale Modal */}
      <QuickSale
        isOpen={showQuickSale}
        onClose={() => setShowQuickSale(false)}
        onSaleComplete={loadSales}
      />
    </div>
  );
};

export default SellerDashboard;