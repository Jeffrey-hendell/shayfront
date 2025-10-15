import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  UserX, 
  UserCheck, 
  Mail, 
  Edit, 
  Phone, 
  MapPin,
  IdCard,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { adminService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SellerModal from '../../components/admin/SellerModal';
import EditSellerModal from '../../components/admin/EditSellerModal';
import toast from 'react-hot-toast';

const Sellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      const data = await adminService.getSellers();
      setSellers(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des vendeurs');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (sellerId, currentStatus) => {
    try {
      await adminService.toggleSellerStatus(sellerId, !currentStatus);
      toast.success(`Vendeur ${!currentStatus ? 'activé' : 'désactivé'} avec succès`);
      loadSellers();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleEdit = (seller) => {
    setSelectedSeller(seller);
    setIsEditModalOpen(true);
  };

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = 
      seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.nif?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.passport_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && seller.is_active) ||
      (statusFilter === 'inactive' && !seller.is_active);

    return matchesSearch && matchesStatus;
  });

  const activeSellersCount = sellers.filter(s => s.is_active).length;
  const inactiveSellersCount = sellers.filter(s => !s.is_active).length;

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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des vendeurs</h1>
          <p className="text-gray-600 mt-2">
            {sellers.length} vendeur(s) enregistré(s) • {activeSellersCount} actif(s) • {inactiveSellersCount} inactif(s)
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors flex items-center mt-4 sm:mt-0"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau vendeur
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-primary-100">
              <Shield className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vendeurs Actifs</p>
              <p className="text-2xl font-bold text-gray-900">{activeSellersCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-warning-100">
              <UserX className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vendeurs Inactifs</p>
              <p className="text-2xl font-bold text-gray-900">{inactiveSellersCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-success-100">
              <IdCard className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avec Documents</p>
              <p className="text-2xl font-bold text-gray-900">
                {sellers.filter(s => s.nif || s.passport_number).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone, NIF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs seulement</option>
          <option value="inactive">Inactifs seulement</option>
        </select>

        <button
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
          }}
          className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          Réinitialiser
        </button>
      </div>

      {/* Sellers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact d'Urgence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'ajout
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSellers.map((seller) => (
                <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10">
                        {seller.profile_picture ? (
                          <img
                            src={seller.profile_picture}
                            alt={seller.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">
                              {seller.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{seller.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{seller.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {seller.email}
                      </div>
                      {seller.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {seller.phone}
                        </div>
                      )}
                      {seller.address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="truncate max-w-xs">{seller.address}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1 text-sm">
                      {seller.nif ? (
                        <div className="text-gray-900">
                          <strong>NIF:</strong> {seller.nif}
                        </div>
                      ) : (
                        <div className="text-warning-600 flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          <span>NIF manquant</span>
                        </div>
                      )}
                      {seller.passport_number ? (
                        <div className="text-gray-600">
                          <strong>Passeport:</strong> {seller.passport_number}
                        </div>
                      ) : (
                        <div className="text-warning-600 flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          <span>Passeport manquant</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1 text-sm">
                      {seller.emergency_contact_name ? (
                        <>
                          <div className="text-gray-900">
                            <strong>Nom:</strong> {seller.emergency_contact_name}
                          </div>
                          {seller.emergency_contact_phone && (
                            <div className="text-gray-600">
                              <strong>Tél:</strong> {seller.emergency_contact_phone}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-warning-600 flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          <span>Contact manquant</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(seller.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(seller.created_at).toLocaleTimeString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      seller.is_active
                        ? 'bg-success-100 text-success-800'
                        : 'bg-danger-100 text-danger-800'
                    }`}>
                      {seller.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(seller)}
                        className="p-2 text-gray-400 hover:text-primary-600 rounded-lg transition-colors hover:bg-primary-50"
                        title="Modifier le vendeur"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(seller.id, seller.is_active)}
                        className={`p-2 rounded-lg transition-colors ${
                          seller.is_active
                            ? 'text-danger-600 hover:bg-danger-50'
                            : 'text-success-600 hover:bg-success-50'
                        }`}
                        title={seller.is_active ? 'Désactiver le vendeur' : 'Activer le vendeur'}
                      >
                        {seller.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredSellers.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <UserX className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun vendeur trouvé</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'Aucun vendeur ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                : 'Aucun vendeur n\'a été enregistré. Commencez par ajouter votre premier vendeur.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2 inline" />
                Ajouter un vendeur
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <SellerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={loadSellers}
      />

      <EditSellerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSeller(null);
        }}
        seller={selectedSeller}
        onSave={loadSellers}
      />
    </div>
  );
};

export default Sellers;