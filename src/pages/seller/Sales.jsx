import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, Calendar, User, Package, DollarSign, X } from 'lucide-react';
import { saleService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// Composant Modal pour les détails de vente (lecture seule)
const SaleDetailsModal = ({ isOpen, onClose, saleId }) => {
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && saleId) {
      loadSaleDetails();
    } else {
      // Reset state when modal closes
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Détails de la vente
            </h2>
            {sale && (
              <p className="text-sm text-gray-600 mt-1">
                Facture #{sale.invoice_number}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des détails...</p>
          </div>
        ) : sale ? (
          <div className="p-6 space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary-600" />
                  Informations client
                </h3>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Nom:</strong> {sale.customer_name}</p>
                  {sale.customer_email && (
                    <p className="text-sm"><strong>Email:</strong> {sale.customer_email}</p>
                  )}
                  {sale.customer_phone && (
                    <p className="text-sm"><strong>Téléphone:</strong> {sale.customer_phone}</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Informations vente
                </h3>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Vendeur:</strong> {sale.seller_name || 'Non spécifié'}</p>
                  <p className="text-sm">
                    <strong>Méthode de paiement:</strong>{' '}
                    <span className="capitalize">{sale.payment_method}</span>
                  </p>
                  <p className="text-sm">
                    <strong>Date:</strong> {new Date(sale.created_at).toLocaleString('fr-FR')}
                  </p>
                  <p className="text-xl font-bold text-primary-600 mt-2">
                    Total: {parseFloat(sale.total_amount || 0).toFixed(2)} GDS
                  </p>
                </div>
              </div>
            </div>

            {/* Articles vendus */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Package className="h-5 w-5 mr-2 text-orange-600" />
                Articles vendus
              </h3>
              <div className="space-y-3">
                {sale.items && sale.items.length > 0 ? (
                  sale.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.product_name || item.name || 'Produit sans nom'}
                        </p>
                        {item.product_id && (
                          <p className="text-sm text-gray-600">
                            Référence: {item.product_id}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-600">
                          {parseFloat(item.subtotal || (item.unit_price || 0) * (item.quantity || 1)).toFixed(2)} GDS
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.quantity || 1} × {parseFloat(item.unit_price || 0).toFixed(2)} GDS
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucun article trouvé</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-600">Impossible de charger les détails de la vente</p>
            <button
              onClick={loadSaleDetails}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      // Utilise getMySales() pour récupérer les ventes du vendeur connecté
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

  // Calcul des statistiques personnelles
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

  // Fonction pour obtenir les classes CSS selon la méthode de paiement
  const getPaymentMethodClasses = (method) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize';
    
    switch (method) {
      case 'cash':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'moncash':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'natcash':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'mastercard':
      case 'visa':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'paypal':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'stripe':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Ventes</h1>
          <p className="text-gray-600 mt-2">
            Vue d'ensemble de votre activité commerciale
          </p>
        </div>
      </div>

      {/* Stats Summary Personnelles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-600">Ventes Total</div>
          <div className="text-2xl font-bold text-gray-900">{totalSalesCount}</div>
          <div className="text-xs text-gray-500 mt-1">Toutes périodes</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-600">Chiffre d'Affaires</div>
          <div className="text-2xl font-bold text-primary-600">{totalRevenue.toFixed(2)} GDS</div>
          <div className="text-xs text-gray-500 mt-1">Toutes périodes</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-600">Ventes Aujourd'hui</div>
          <div className="text-2xl font-bold text-green-600">{todaySales}</div>
          <div className="text-xs text-gray-500 mt-1">Ce jour</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-600">Mensuel</div>
          <div className="text-2xl font-bold text-blue-600">{monthlyRevenue.toFixed(2)} GDS</div>
          <div className="text-xs text-gray-500 mt-1">Ce mois</div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par facture ou client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={() => {
            setSearchTerm('');
            setDateFilter('');
          }}
          className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          Réinitialiser
        </button>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facture
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paiement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-mono text-sm text-primary-600 font-medium">
                      #{sale.invoice_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{sale.customer_name}</div>
                    {sale.customer_email && (
                      <div className="text-sm text-gray-500">{sale.customer_email}</div>
                    )}
                    {sale.customer_phone && (
                      <div className="text-sm text-gray-500">{sale.customer_phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-primary-600 text-lg">
                      {parseFloat(sale.total_amount || 0).toFixed(2)} GDS
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
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
                        className="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-colors hover:bg-primary-50"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleGenerateInvoice(sale.id)}
                        className="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-colors hover:bg-primary-50"
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
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune vente trouvée</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm || dateFilter 
                ? 'Aucune vente ne correspond à vos critères de recherche.'
                : 'Vous n\'avez effectué aucune vente pour le moment.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Sale Details Modal (Lecture seule) */}
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