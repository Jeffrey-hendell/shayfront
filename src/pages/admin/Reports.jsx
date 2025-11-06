import React, { useState, useEffect, useCallback } from 'react';
import { Download, BarChart3, TrendingUp, Users, Package } from 'lucide-react';
import { adminService, statsService } from '../../services/api';
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
  LineChart,
  Line
} from 'recharts';

const Reports = () => {
  const [stats, setStats] = useState({});
  const [sellerStats, setSellerStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [exportLoading, setExportLoading] = useState(false);

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
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport-ventes-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Rapport exporté avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center flex items-center justify-center flex-col">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse-slow">
                <img src="https://i.ibb.co/Lhbx4PKX/S-11-6-2025-1.png" alt="Shay" className='h-12 w-12'/>
              </div>
          <p className="text-gray-600 animate-pulse">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports et analyses</h1>
          <p className="text-gray-600 mt-2">
            Analyse détaillée de votre performance commerciale
          </p>
        </div>
        
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="day">Aujourd'hui</option>
            <option value="week">7 derniers jours</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
          
          <button
            onClick={handleExportExcel}
            disabled={exportLoading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            {exportLoading ? 'Export...' : 'Excel'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-primary-100">
              <TrendingUp className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.stats?.total_revenue || 0} GDS
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-success-100">
              <BarChart3 className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total des ventes</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.stats?.total_sales || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-warning-100">
              <Users className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vendeurs actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {sellerStats.seller_stats?.active_sellers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-danger-100">
              <Package className="h-6 w-6 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Produits vendus</p>
              <p className="text-2xl font-bold text-gray-900">
                {sellerStats.top_products?.reduce((sum, product) => sum + (parseInt(product.total_quantity) || 0), 0) || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Évolution du chiffre d'affaires
          </h3>
          <div className="h-80">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
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
                  />
                  <Bar 
                    dataKey="total_amount" 
                    fill="#0ea5e9" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Aucune donnée de vente disponible
              </div>
            )}
          </div>
        </div>

        {/* Categories Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Répartition par catégorie
          </h3>
          <div className="h-80">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => {
                      if (name === 'value') return [`${value} unités`, 'Quantité vendue'];
                      return [value, name];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Aucune donnée de catégorie disponible
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance des Vendeurs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance des vendeurs
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {sellerPerformance.map((seller, index) => (
              <div key={seller.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-primary-600">
                      {seller.name?.charAt(0)?.toUpperCase() || 'V'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{seller.name || 'Vendeur'}</p>
                    <p className="text-sm text-gray-600">{seller.total_sales || 0} ventes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-600">
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
                Aucune donnée de performance disponible
              </div>
            )}
          </div>
        </div>

        {/* Produits les Plus Vendus */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Produits les plus vendus
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="capitalize">{product.category}</span>
                    <span>•</span>
                    <span>{product.total_quantity} unités</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-600">
                    {parseFloat(product.total_revenue || 0).toFixed(2)} GDS
                  </p>
                  <p className="text-sm text-gray-500">CA total</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucune donnée de produits disponible
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Statistiques Produits */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Statistiques Produits
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total produits:</span>
              <span className="font-semibold">{sellerStats.product_stats?.total_products || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">En stock:</span>
              <span className="font-semibold text-success-600">
                {sellerStats.product_stats?.in_stock_products || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rupture de stock:</span>
              <span className="font-semibold text-danger-600">
                {sellerStats.product_stats?.out_of_stock_products || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Stock total:</span>
              <span className="font-semibold">{sellerStats.product_stats?.total_stock || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Prix moyen:</span>
              <span className="font-semibold">
                {Math.round(sellerStats.product_stats?.average_price || 0)} GDS
              </span>
            </div>
          </div>
        </div>

        {/* Statistiques Vendeurs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Statistiques Vendeurs
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total vendeurs:</span>
              <span className="font-semibold">{sellerStats.seller_stats?.total_sellers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Vendeurs actifs:</span>
              <span className="font-semibold text-success-600">
                {sellerStats.seller_stats?.active_sellers || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Vendeurs inactifs:</span>
              <span className="font-semibold text-danger-600">
                {sellerStats.seller_stats?.inactive_sellers || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Vente moyenne:</span>
              <span className="font-semibold">
                {parseFloat(stats.stats?.average_sale || 0).toFixed(2)} GDS
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
