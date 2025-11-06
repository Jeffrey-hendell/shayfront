import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Eye, 
  Calendar, 
  Trash2, 
  Edit,
  Filter,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Sparkles,
  MoreVertical,
  FileText,
  Receipt,
  User,
  CreditCard,
  Zap,
  RefreshCw,
  Phone
} from 'lucide-react';
import { saleService, adminService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SaleDetailsModal from '../../components/admin/SaleDetailsModal';
import toast from 'react-hot-toast';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await saleService.getSales();
      setSales(data);
    } catch (error) {
      toast.error('❌ Erreur lors du chargement des ventes');
    } finally {
      setLoading(false);
    }
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
      toast.success('📄 Facture téléchargée avec succès');
    } catch (error) {
      toast.error('❌ Erreur lors du téléchargement');
    }
  };

  const handleViewDetails = (saleId) => {
    setSelectedSaleId(saleId);
    setIsDetailsModalOpen(true);
  };

  const handleSaleUpdate = () => {
    loadSales();
  };

  const handleDeleteSale = async (saleId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette vente ? Cette action est irréversible.')) {
      try {
        await adminService.deleteSale(saleId);
        toast.success('🗑️ Vente supprimée avec succès');
        loadSales();
      } catch (error) {
        toast.error(error.response?.data?.error || '❌ Erreur lors de la suppression');
      }
    }
  };

  const filteredSales = sales
    .filter(sale => {
      const matchesSearch = 
        sale.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.seller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = !dateFilter || 
        new Date(sale.created_at).toISOString().split('T')[0].includes(dateFilter);

      const matchesPayment = paymentFilter === 'all' || sale.payment_method === paymentFilter;

      return matchesSearch && matchesDate && matchesPayment;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'amount_high':
          return parseFloat(b.total_amount) - parseFloat(a.total_amount);
        case 'amount_low':
          return parseFloat(a.total_amount) - parseFloat(b.total_amount);
        default:
          return 0;
      }
    });

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
  const totalSalesCount = filteredSales.length;
  const averageSale = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;
  const uniqueSellers = [...new Set(filteredSales.map(sale => sale.seller_id))].length;

  // Statistiques par méthode de paiement
  const paymentStats = filteredSales.reduce((acc, sale) => {
    const method = sale.payment_method || 'unknown';
    if (!acc[method]) {
      acc[method] = { count: 0, amount: 0 };
    }
    acc[method].count++;
    acc[method].amount += parseFloat(sale.total_amount);
    return acc;
  }, {});

  const getPaymentMethodClasses = (method) => {
    const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize';
    
    switch (method) {
      case 'cash':
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
      case 'moncash':
        return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`;
      case 'natcash':
        return `${baseClasses} bg-purple-100 text-purple-800 border border-purple-200`;
      case 'mastercard':
      case 'visa':
        return `${baseClasses} bg-orange-100 text-orange-800 border border-orange-200`;
      case 'paypal':
        return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`;
      case 'stripe':
        return `${baseClasses} bg-purple-100 text-purple-800 border border-purple-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return '💵';
      case 'moncash':
        return '📱';
      case 'natcash':
        return '🏦';
      case 'mastercard':
      case 'visa':
        return '💳';
      case 'paypal':
        return '🔵';
      case 'stripe':
        return '💜';
      default:
        return '💰';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-slow">
                <img src="https://i.ibb.co/Lhbx4PKX/S-11-6-2025-1.png" alt="Shay" className='h-12 w-12'/>
              </div>
          <p className="text-gray-600 animate-pulse">Chargement des ventes...</p>
        </div>
      </div>
    );
  }

  const paymentMethods = [
    { value: 'all', label: 'Tous les paiements' },
    { value: 'cash', label: 'Espèces' },
    { value: 'moncash', label: 'MonCash' },
    { value: 'natcash', label: 'NatCash' },
    { value: 'mastercard', label: 'Carte Bancaire' },
    { value: 'visa', label: 'Visa' },
    { value: 'paypal', label: 'PayPal' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Plus récentes' },
    { value: 'oldest', label: 'Plus anciennes' },
    { value: 'amount_high', label: 'Montant élevé' },
    { value: 'amount_low', label: 'Montant faible' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-primary-500 to-blue-500 rounded-xl shadow-lg">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Historique des Ventes
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              Gérez et suivez l'ensemble des transactions commerciales
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={loadSales}
              className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </button>
            <button className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ventes</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{totalSalesCount}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chiffre d'Affaires</p>
                <p className="text-xl font-bold text-primary-600 mt-1">{totalRevenue.toFixed(2)} GDS</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vente Moyenne</p>
                <p className="text-xl font-bold text-orange-600 mt-1">{averageSale.toFixed(2)} GDS</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vendeurs Actifs</p>
                <p className="text-xl font-bold text-purple-600 mt-1">{uniqueSellers}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par facture, client, vendeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 backdrop-blur-sm"
              />
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Filter */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                />
              </div>

              {/* Payment Filter */}
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Reset */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('');
                  setPaymentFilter('all');
                  setSortBy('recent');
                }}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Payment Methods Stats */}
        {Object.keys(paymentStats).length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-primary-600" />
              Méthodes de Paiement
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(paymentStats).map(([method, stats]) => (
                <div key={method} className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-2xl mb-2">{getPaymentMethodIcon(method)}</div>
                  <div className="text-sm font-medium text-gray-900 capitalize">{method}</div>
                  <div className="text-lg font-bold text-primary-600">{stats.count}</div>
                  <div className="text-xs text-gray-600">{stats.amount.toFixed(2)} GDS</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sales Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Facture
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Vendeur
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Paiement
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-white/50 transition-all duration-300 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-mono text-sm font-bold text-primary-600">
                            #{sale.invoice_number}
                          </div>
                          <div className="text-xs text-gray-500">Réf: </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">{sale.customer_name}</div>
                        {sale.customer_email && (
                          <div className="text-sm text-gray-600 flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {sale.customer_email}
                          </div>
                        )}
                        {sale.customer_phone && (
                          <div className="text-sm text-gray-600 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {sale.customer_phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">
                            {sale.seller_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">{sale.seller_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-xl font-bold text-primary-600">
                          {parseFloat(sale.total_amount).toFixed(2)} GDS
                        </div>
                        <div className="text-xs text-gray-500">
                          {sale.items?.length || 0} article(s)
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(sale.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(sale.created_at).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getPaymentMethodClasses(sale.payment_method)}>
                        {getPaymentMethodIcon(sale.payment_method)} {sale.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => handleViewDetails(sale.id)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-300"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleGenerateInvoice(sale.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                          title="Télécharger la facture"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                          title="Supprimer la vente"
                        >
                          <Trash2 className="h-4 w-4" />
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
              <div className="w-24 h-24 bg-gradient-to-r from-primary-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Receipt className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchTerm ? 'Aucune vente trouvée' : 'Aucune vente enregistrée'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                {searchTerm 
                  ? 'Aucune vente ne correspond à votre recherche. Essayez avec d\'autres termes.'
                  : 'Les ventes apparaîtront ici une fois que vos premiers transactions seront enregistrées.'
                }
              </p>
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
          onUpdate={handleSaleUpdate}
        />
      </div>
    </div>
  );
};

export default Sales;
