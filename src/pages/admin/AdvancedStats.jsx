import React, { useState, useEffect } from 'react';
import { 
  Users, Package, TrendingUp, Award, 
  ShoppingCart, Star, BarChart3 
} from 'lucide-react';
import { statsService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const AdvancedStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await statsService.getSellerPerformance();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucune donnée statistique disponible</p>
      </div>
    );
  }

  const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques Avancées</h1>
          <p className="text-gray-600 mt-2">
            Analyse détaillée des performances commerciales
          </p>
        </div>
      </div>

      {/* Statistiques Vendeurs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-primary-100">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Vendeurs</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.seller_stats?.total_sellers || 0}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="text-center">
              <p className="text-sm text-success-600 font-medium">
                {stats.seller_stats?.active_sellers || 0}
              </p>
              <p className="text-xs text-gray-500">Actifs</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-danger-600 font-medium">
                {stats.seller_stats?.inactive_sellers || 0}
              </p>
              <p className="text-xs text-gray-500">Inactifs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-success-100">
              <Package className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Produits en Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.product_stats?.in_stock_products || 0}
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Sur {stats.product_stats?.total_products || 0} produits
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-warning-100">
              <TrendingUp className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.product_stats?.total_stock || 0}
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Prix moyen: {Math.round(stats.product_stats?.average_price || 0)} GDS
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance des Vendeurs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-primary-600" />
            Performance des Vendeurs
          </h3>
          <div className="space-y-4">
            {stats.seller_performance?.map((seller, index) => (
              <div key={seller.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">
                      {seller.name?.charAt(0).toUpperCase() || 'V'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{seller.name || 'Vendeur'}</p>
                    <p className="text-sm text-gray-500">{seller.total_sales || 0} ventes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-600">
                    {parseFloat(seller.total_revenue || 0).toFixed(2)} GDS
                  </p>
                  <p className="text-sm text-gray-500">
                    Moyenne: {parseFloat(seller.average_sale || 0).toFixed(2)} GDS
                  </p>
                </div>
              </div>
            ))}
            {(!stats.seller_performance || stats.seller_performance.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                Aucune donnée de performance disponible
              </div>
            )}
          </div>
        </div>

        {/* Produits les Plus Vendus */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2 text-warning-600" />
            Produits les Plus Vendus
          </h3>
          <div className="space-y-3">
            {stats.top_products?.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
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
            {(!stats.top_products || stats.top_products.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                Aucune donnée de produits disponible
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des ventes par vendeur */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Répartition du CA par Vendeur
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.seller_performance?.filter(s => s.total_revenue > 0) || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, total_revenue }) => 
                    `${name}: ${parseFloat(total_revenue).toFixed(0)}GDS`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total_revenue"
                >
                  {stats.seller_performance?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${parseFloat(value).toFixed(2)} GDS`, 'Chiffre d\'affaires']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top produits graphique */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top 5 des Produits par Quantité
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.top_products?.slice(0, 5) || []}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'total_quantity') return [value, 'Quantité vendue'];
                    if (name === 'total_revenue') return [`${parseFloat(value).toFixed(2)} GDS`, 'CA total'];
                    return [value, name];
                  }}
                />
                <Bar 
                  dataKey="total_quantity" 
                  fill="#0ea5e9" 
                  radius={[4, 4, 0, 0]}
                  name="total_quantity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedStats;