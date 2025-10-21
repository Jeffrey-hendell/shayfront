import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, Calendar, Trash2, Edit, X, User, Package, DollarSign } from 'lucide-react';
import { saleService, adminService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

// Composant Modal pour les détails de vente
const SaleDetailsModal = ({ isOpen, onClose, saleId, onUpdate }) => {
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen && saleId) {
      loadSaleDetails();
    }
  }, [isOpen, saleId]);

  const loadSaleDetails = async () => {
    try {
      setLoading(true);
      const saleData = await adminService.getSaleDetails(saleId);
      setSale(saleData);
      setFormData({
        customer_name: saleData.customer_name,
        customer_email: saleData.customer_email,
        customer_phone: saleData.customer_phone,
        payment_method: saleData.payment_method,

      });
    } catch (error) {
      toast.error('Erreur lors du chargement des détails');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminService.updateSale(saleId, formData);
      toast.success('Vente modifiée avec succès');
      setEditMode(false);
      onUpdate();
      loadSaleDetails();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette vente ? Cette action est irréversible.')) {
      try {
        await adminService.deleteSale(saleId);
        toast.success('Vente supprimée avec succès');
        onUpdate();
        onClose();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
      }
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
          <div className="flex items-center space-x-2">
            {sale && !editMode && (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-colors"
                  title="Modifier la vente"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-400 hover:text-danger-600 rounded-lg transition-colors"
                  title="Supprimer la vente"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des détails...</p>
          </div>
        ) : sale ? (
          <div className="p-6">
            {editMode ? (
              // Mode édition
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du client *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customer_name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email du client
                    </label>
                    <input
                      type="email"
                      value={formData.customer_email || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone du client
                    </label>
                    <input
                      type="tel"
                      value={formData.customer_phone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Méthode de paiement *
                    </label>
                    <select
                      required
                      value={formData.payment_method || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="cash">Espèces</option>
                      <option value="moncash">Moncash</option>
                      <option value="natcash">Natcash</option>
                      <option value="mastercard">Mastercard</option>
                      <option value="visa">Visa</option>
                      <option value="paypal">PayPal</option>
                      <option value="stripe">Stripe</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Sauvegarde...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            ) : (
              // Mode affichage
              <div className="space-y-6">
                {/* Informations générales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2 text-primary-600" />
                      Informations client
                    </h3>
                    <div className="space-y-2">
                      <p><strong>Nom:</strong> {sale.customer_name}</p>
                      {sale.customer_email && <p><strong>Email:</strong> {sale.customer_email}</p>}
                      {sale.customer_phone && <p><strong>Téléphone:</strong> {sale.customer_phone}</p>}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-success-600" />
                      Informations vente
                    </h3>
                    <div className="space-y-2">
                      <p><strong>Vendeur:</strong> {sale.seller_name}</p>
                      <p><strong>Méthode de paiement:</strong> 
                        <span className="capitalize"> {sale.payment_method}</span>
                      </p>
                      <p><strong>Date:</strong> {new Date(sale.created_at).toLocaleString('fr-FR')}</p>
                      <p className="text-xl font-bold text-primary-600">
                        Total: {parseFloat(sale.total_amount).toFixed(2)} GDS
                      </p>
                    </div>
                  </div>
                </div>

                {/* Articles vendus */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-warning-600" />
                    Articles vendus
                  </h3>
                  <div className="space-y-3">
                    {sale.items && sale.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.product_name || item.name}
                          </p>
                          {item.product_id && (
                            <p className="text-sm text-gray-600">
                              Référence: {item.product_id}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary-600">
                            {parseFloat(item.subtotal || item.unit_price * item.quantity).toFixed(2)} GDS
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} × {parseFloat(item.unit_price).toFixed(2)} GDS
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-600">Impossible de charger les détails de la vente</p>
          </div>
        )}
      </div>
    </div>
  );
};


export default SaleDetailsModal;