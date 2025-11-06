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
  AlertTriangle,
  Filter,
  Download,
  MoreVertical,
  Sparkles,
  TrendingUp,
  Users,
  Eye,
  Calendar,
  Zap,
  Crown,
  BadgeCheck,
  Star
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
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');

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

  const handleQuickView = (seller) => {
    // Implémentez la vue rapide ici
    toast.success(`👀 Vue rapide: ${seller.name}`);
  };

  const filteredSellers = sellers
    .filter(seller => {
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
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'active':
          return (b.is_active === a.is_active) ? 0 : b.is_active ? -1 : 1;
        default:
          return 0;
      }
    });

  const activeSellersCount = sellers.filter(s => s.is_active).length;
  const inactiveSellersCount = sellers.filter(s => !s.is_active).length;
  const verifiedSellersCount = sellers.filter(s => s.nif || s.passport_number).length;

  if (loading) {
    return (
     <div className="min-h-screen flex items-center justify-center">
        <div className="text-center flex items-center justify-center flex-col">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse-slow">
                <img src="https://i.ibb.co/Lhbx4PKX/S-11-6-2025-1.png" alt="Shay" className='h-12 w-12'/>
              </div>
          <p className="text-gray-600 animate-pulse">Chargement des vendeurs...</p>
        </div>
      </div>
    );
  }

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts', icon: Users },
    { value: 'active', label: 'Actifs seulement', icon: UserCheck },
    { value: 'inactive', label: 'Inactifs seulement', icon: UserX }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Plus récents' },
    { value: 'name', label: 'Nom A-Z' },
    { value: 'active', label: 'Statut actif' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-primary-500 to-blue-500 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Gestion des Vendeurs
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              Gérez votre équipe commerciale et suivez leurs performances
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-gradient-to-r from-primary-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouveau Vendeur
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vendeurs</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{sellers.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vendeurs Actifs</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{activeSellersCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vendeurs Inactifs</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{inactiveSellersCount}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <UserX className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vérifiés</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{verifiedSellersCount}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <BadgeCheck className="h-6 w-6 text-purple-600" />
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
                placeholder="Rechercher par nom, email, téléphone, NIF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 backdrop-blur-sm"
              />
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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

              {/* View Toggle */}
              <div className="flex bg-white/50 border border-gray-200/50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-primary-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-primary-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="w-4 h-4 flex flex-col space-y-0.5">
                    <div className="bg-current h-1 rounded-sm"></div>
                    <div className="bg-current h-1 rounded-sm"></div>
                    <div className="bg-current h-1 rounded-sm"></div>
                  </div>
                </button>
              </div>

              {/* Reset */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSortBy('recent');
                }}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Sellers Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSellers.map((seller) => (
              <SellerCard 
                key={seller.id} 
                seller={seller} 
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
                onQuickView={handleQuickView}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden">
            {filteredSellers.map((seller) => (
              <SellerListItem 
                key={seller.id} 
                seller={seller} 
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
                onQuickView={handleQuickView}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredSellers.length === 0 && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50">
            <div className="w-24 h-24 bg-gradient-to-r from-primary-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Users className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm ? 'Aucun vendeur trouvé' : 'Aucun vendeur enregistré'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              {searchTerm 
                ? 'Aucun vendeur ne correspond à votre recherche. Essayez avec d\'autres termes.'
                : 'Commencez par ajouter votre premier vendeur à votre équipe commerciale.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center mx-auto shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Ajouter le premier vendeur
              </button>
            )}
          </div>
        )}

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
    </div>
  );
};

// Composant Carte Vendeur
const SellerCard = ({ seller, onEdit, onToggleStatus, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header avec Photo et Statut */}
      <div className="relative p-6 pb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {seller.profile_picture ? (
              <img
                src={seller.profile_picture}
                alt={seller.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">
                  {seller.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
              seller.is_active ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                {seller.name}
              </h3>
              {(seller.nif || seller.passport_number) && (
                <BadgeCheck className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <p className="text-sm text-gray-600 capitalize">{seller.role}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                seller.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {seller.is_active ? 'Actif' : 'Inactif'}
              </span>
              {seller.nif && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  NIF
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions au survol */}
        <div className={`absolute top-4 right-4 flex flex-col space-y-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}>
          <button
            onClick={() => onQuickView(seller)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-primary-500 hover:text-white transition-all duration-300"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(seller)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-blue-500 hover:text-white transition-all duration-300"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Informations de Contact */}
      <div className="px-6 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-3 text-gray-400" />
            <span className="truncate">{seller.email}</span>
          </div>
          {seller.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-3 text-gray-400" />
              <span>{seller.phone}</span>
            </div>
          )}
          {seller.address && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-3 text-gray-400" />
              <span className="truncate">{seller.address}</span>
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="pt-2 border-t border-gray-200/50">
          <div className="space-y-2">
            {!seller.nif && !seller.passport_number && (
              <div className="flex items-center text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                <AlertTriangle className="h-3 w-3 mr-2" />
                Documents manquants
              </div>
            )}
            {seller.nif && (
              <div className="flex items-center text-xs text-gray-600">
                <IdCard className="h-3 w-3 mr-2" />
                <span>NIF: {seller.nif}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer avec Actions */}
      <div className="px-6 pb-6 pt-4">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(seller)}
            className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-500 hover:text-white transition-all duration-300 flex items-center justify-center text-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </button>
          <button
            onClick={() => onToggleStatus(seller.id, seller.is_active)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center justify-center text-sm ${
              seller.is_active
                ? 'bg-red-50 text-red-600 hover:bg-red-500 hover:text-white'
                : 'bg-green-50 text-green-600 hover:bg-green-500 hover:text-white'
            }`}
          >
            {seller.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant Ligne Vendeur (Vue Liste)
const SellerListItem = ({ seller, onEdit, onToggleStatus, onQuickView }) => {
  return (
    <div className="group flex items-center p-6 border-b border-gray-200/50 hover:bg-white/50 transition-all duration-300 last:border-b-0">
      {/* Photo et Nom */}
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className="relative">
          {seller.profile_picture ? (
            <img
              src={seller.profile_picture}
              alt={seller.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">
                {seller.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
            seller.is_active ? 'bg-green-500' : 'bg-red-500'
          }`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
              {seller.name}
            </h3>
            {(seller.nif || seller.passport_number) && (
              <BadgeCheck className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <p className="text-sm text-gray-600 capitalize">{seller.role}</p>
        </div>
      </div>

      {/* Contact */}
      <div className="hidden md:block flex-1 min-w-0">
        <div className="space-y-1">
          <div className="text-sm text-gray-900 truncate">{seller.email}</div>
          {seller.phone && (
            <div className="text-sm text-gray-600">{seller.phone}</div>
          )}
        </div>
      </div>

      {/* Documents */}
      <div className="hidden lg:block flex-1 min-w-0">
        <div className="space-y-1">
          {seller.nif ? (
            <div className="text-sm text-gray-900">NIF: {seller.nif}</div>
          ) : (
            <div className="text-sm text-orange-600 flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              NIF manquant
            </div>
          )}
        </div>
      </div>

      {/* Date */}
      <div className="hidden xl:block text-sm text-gray-600">
        {new Date(seller.created_at).toLocaleDateString('fr-FR')}
      </div>

      {/* Statut */}
      <div className="px-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          seller.is_active
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {seller.is_active ? 'Actif' : 'Inactif'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onQuickView(seller)}
          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-300"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          onClick={() => onEdit(seller)}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => onToggleStatus(seller.id, seller.is_active)}
          className={`p-2 rounded-lg transition-all duration-300 ${
            seller.is_active
              ? 'text-red-600 hover:bg-red-50'
              : 'text-green-600 hover:bg-green-50'
          }`}
        >
          {seller.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

export default Sellers;
