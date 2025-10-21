import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, Calendar, User, Package, DollarSign, X, Filter, TrendingUp, Users, ShoppingCart, BarChart3 } from 'lucide-react';
import { saleService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// Composant Modal pour les détails de vente
const SaleDetailsModal = ({ isOpen, onClose, saleId }) => {
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && saleId) {
      loadSaleDetails();
    } else {
      setSale(null);
      setLoading(false);
    }
  }, [isOpen, saleId]);

  const loadSaleDetails = async () => {
    try {
      setLoading(true);
      const saleData = await saleService.getSaleDetails(saleId);
      setSale(saleData);
    } catch (error) {
      console.error('Erreur détaillée:', error);
      toast.error('Erreur lors du chargement des détails de la vente');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60 bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Détails de la vente
            </h2>
            {sale && (
              <p className="text-sm text-gray-600 mt-1 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Facture #{sale.invoice_number}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des détails...</p>
          </div>
        ) : sale ? (
          <div className="p-6 space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-3 text-blue-600" />
                  Informations client
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nom complet</p>
                    <p className="text-lg font-semibold text-gray-900">{sale.customer_name}</p>
                  </div>
                  {sale.customer_email && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="text-base text-gray-900">{sale.customer_email}</p>
                    </div>
                  )}
                  {sale.customer_phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Téléphone</p>
                      <p className="text-base text-gray-900">{sale.customer_phone}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-3 text-green-600" />
                  Informations vente
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Vendeur</p>
                    <p className="text-base text-gray-900">{sale.seller_name || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Méthode de paiement</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 capitalize">
                      {sale.payment_method}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Date</p>
                    <p className="text-base text-gray-900">
                      {new Date(sale.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-green-200/50">
                    <p className="text-2xl font-bold text-green-600">
                      {parseFloat(sale.total_amount || 0).toFixed(2)} GDS
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Articles vendus */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-3 text-orange-600" />
                Articles vendus
              </h3>
              <div className="space-y-4">
                {sale.items && sale.items.length > 0 ? (
                  sale.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-orange-200/50 backdrop-blur-sm">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-lg">
                          {item.product_name || item.name || 'Produit sans nom'}
                        </p>
                        {item.product_id && (
                          <p className="text-sm text-gray-600 mt-1">
                            Référence: {item.product_id}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-600 text-lg">
                          {parseFloat(item.subtotal || (item.unit_price || 0) * (item.quantity || 1)).toFixed(2)} GDS
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.quantity || 1} × {parseFloat(item.unit_price || 0).toFixed(2)} GDS
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-orange-300 mx-auto mb-3" />
                    <p className="text-gray-500">Aucun article trouvé</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-gray-600 mb-4">Impossible de charger les détails de la vente</p>
            <button
              onClick={loadSaleDetails}
              className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 transform hover:scale-105"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant principal Dashboard Seller
const SellerDashboard = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    todaySales: 0,
    monthlyRevenue: 0,
    averageSale: 0
  });

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [sales, searchTerm, dateFilter]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await saleService.getMySales(); 
      setSales(data.sales || data || []);
    } catch (error) {
      console.error('Erreur chargement ventes:', error);
      toast.error('Erreur lors du chargement de vos ventes');
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const filteredSales = sales.filter(sale => {
      const searchLower = searchTerm.toLowerCase();
      const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
      
      return (
        sale.invoice_number?.toLowerCase().includes(searchLower) ||
        sale.customer_name?.toLowerCase().includes(searchLower) ||
        (dateFilter && saleDate.includes(dateFilter))
      );
    });

    const totalRevenue = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
    const totalSalesCount = filteredSales.length;
    const todaySales = filteredSales.filter(sale => 
      new Date(sale.created_at).toDateString() === new Date().toDateString()
    ).length;
    const monthlyRevenue = filteredSales
      .filter(sale => {
        const saleDate = new Date(sale.created_at);
        const now = new Date();
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
    
    const averageSale = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

    setStats({
      totalRevenue,
      totalSales: totalSalesCount,
      todaySales,
      monthlyRevenue,
      averageSale
    });
  };

  const handleGenerateInvoice = async (saleId) => {
    try {
      const response = await saleService.generateInvoice(saleId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${saleId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Facture téléchargée avec succès');
    } catch (error) {
      console.error('Erreur génération facture:', error);
      toast.error('Erreur lors du téléchargement de la facture');
    }
  };

  const handleViewDetails = (saleId) => {
    setSelectedSaleId(saleId);
    setIsDetailsModalOpen(true);
  };

  const filteredSales = sales.filter(sale => {
    const searchLower = searchTerm.toLowerCase();
    const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
    
    return (
      sale.invoice_number?.toLowerCase().includes(searchLower) ||
      sale.customer_name?.toLowerCase().includes(searchLower) ||
      (dateFilter && saleDate.includes(dateFilter))
    );
  });

  const getPaymentMethodClasses = (method) => {
    const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize transition-all duration-200';
    
    switch (method) {
      case 'cash':
        return `${baseClasses} bg-green-100 text-green-800 hover:bg-green-200`;
      case 'moncash':
        return `${baseClasses} bg-blue-100 text-blue-800 hover:bg-blue-200`;
      case 'natcash':
        return `${baseClasses} bg-purple-100 text-purple-800 hover:bg-purple-200`;
      case 'mastercard':
      case 'visa':
        return `${baseClasses} bg-orange-100 text-orange-800 hover:bg-orange-200`;
      case 'paypal':
        return `${baseClasses} bg-blue-100 text-blue-800 hover:bg-blue-200`;
      case 'stripe':
        return `${baseClasses} bg-purple-100 text-purple-800 hover:bg-purple-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 hover:bg-gray-200`;
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className={`text-xl font-bold ${color} mb-1`}>{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-xl ${color.replace('text', 'bg').replace('-600', '-100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-3 text-sm text-green-600">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Chargement de vos ventes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">
            Tableau de Bord Vendeur
          </h1>
          <p className="text-gray-600 mt-2 flex items-center">
            <BarChart3 className="h-4 w-4 mr-2 text-primary-600" />
            Vue d'ensemble de votre performance commerciale
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={ShoppingCart}
          title="Ventes Total"
          value={stats.totalSales}
          subtitle="Toutes périodes"
          color="text-blue-600"
        />
        <StatCard
          icon={DollarSign}
          title="Chiffre d'Affaires"
          value={`${stats.totalRevenue.toFixed(2)} GDS`}
          subtitle="Revenu total"
          color="text-green-600"
        />
        <StatCard
          icon={Users}
          title="Ventes Aujourd'hui"
          value={stats.todaySales}
          subtitle="Ce jour"
          color="text-purple-600"
        />
        <StatCard
          icon={TrendingUp}
          title="Moyenne par vente"
          value={`${stats.averageSale.toFixed(2)} GDS`}
          subtitle="Panier moyen"
          color="text-orange-600"
        />
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-primary-600" />
            Filtres et Recherche
          </h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {filteredSales.length} vente{filteredSales.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par facture ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setDateFilter('');
            }}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Sales Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Facture
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Paiement
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200/60">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50/80 transition-all duration-200 group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-mono text-sm font-bold text-primary-600 group-hover:text-primary-700 transition-colors">
                      #{sale.invoice_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">{sale.customer_name}</div>
                    {sale.customer_email && (
                      <div className="text-sm text-gray-500">{sale.customer_email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-primary-600 text-lg">
                      {parseFloat(sale.total_amount || 0).toFixed(2)} GDS
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(sale.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(sale.created_at).toLocaleTimeString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getPaymentMethodClasses(sale.payment_method)}>
                      {sale.payment_method}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(sale.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-all duration-200 hover:bg-blue-50 transform hover:scale-110"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleGenerateInvoice(sale.id)}
                        className="p-2 text-gray-400 hover:text-green-600 rounded-lg transition-all duration-200 hover:bg-green-50 transform hover:scale-110"
                        title="Télécharger la facture"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredSales.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune vente trouvée</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchTerm || dateFilter 
                ? 'Aucune vente ne correspond à vos critères de recherche.'
                : 'Vous n\'avez effectué aucune vente pour le moment.'
              }
            </p>
            {(searchTerm || dateFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('');
                }}
                className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 transform hover:scale-105"
              >
                Voir toutes les ventes
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sale Details Modal */}
      <SaleDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedSaleId(null);
        }}
        saleId={selectedSaleId}
      />
    </div>
  );
};

export default SellerDashboard;