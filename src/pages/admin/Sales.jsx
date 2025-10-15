import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, Calendar, Trash2, Edit } from 'lucide-react';
import { saleService, adminService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SaleDetailsModal from '../../components/admin/SaleDetailsModal';
import toast from 'react-hot-toast';

const Sales = () => {
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
      const data = await saleService.getSales();
      setSales(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des ventes');
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
      toast.success('Facture téléchargée avec succès');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleViewDetails = (saleId) => {
    setSelectedSaleId(saleId);
    setIsDetailsModalOpen(true);
  };

  const handleSaleUpdate = () => {
    loadSales(); // Recharger la liste après modification
  };

  const handleDeleteSale = async (saleId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette vente ? Cette action est irréversible.')) {
      try {
        await adminService.deleteSale(saleId);
        toast.success('Vente supprimée avec succès');
        loadSales();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  const filteredSales = sales.filter(sale =>
    sale.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.seller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dateFilter && new Date(sale.created_at).toISOString().split('T')[0].includes(dateFilter))
  );

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
  const totalSalesCount = filteredSales.length;

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
          <h1 className="text-3xl font-bold text-gray-900">Historique des ventes</h1>
          <p className="text-gray-600 mt-2">
            {totalSalesCount} ventes trouvées • {totalRevenue.toFixed(2)} GDS de chiffre d'affaires
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par facture, client ou vendeur..."
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

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-600">Total Ventes</div>
          <div className="text-2xl font-bold text-gray-900">{totalSalesCount}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-600">Chiffre d'Affaires</div>
          <div className="text-2xl font-bold text-primary-600">{totalRevenue.toFixed(2)} GDS</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-600">Vente Moyenne</div>
          <div className="text-2xl font-bold text-gray-900">
            {totalSalesCount > 0 ? (totalRevenue / totalSalesCount).toFixed(2) : '0'} GDS
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-600">Vendeurs Actifs</div>
          <div className="text-2xl font-bold text-gray-900">
            {[...new Set(filteredSales.map(sale => sale.seller_id))].length}
          </div>
        </div>
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
                  Vendeur
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
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-primary-600">
                          {sale.seller_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-900">{sale.seller_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-primary-600 text-lg">
                      {parseFloat(sale.total_amount).toFixed(2)} GDS
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
                        title="Voir les détails et modifier"
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
                      <button
                        onClick={() => handleDeleteSale(sale.id)}
                        className="p-2 text-gray-400 hover:text-danger-600 rounded-lg transition-colors hover:bg-danger-50"
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
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune vente trouvée</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm || dateFilter 
                ? 'Aucune vente ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                : 'Aucune vente n\'a été enregistrée pour le moment. Les ventes apparaîtront ici une fois créées.'
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
  );
};

export default Sales;