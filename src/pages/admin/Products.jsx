import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  Filter,
  Grid,
  List,
  Download,
  Upload,
  Sparkles,
  Tag,
  BarChart3,
  Eye,
  MoreVertical,
  Shield,
  Zap
} from 'lucide-react';
import { productService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductModal from '../../components/admin/ProductModal';
import toast from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await productService.deleteProduct(productId);
        toast.success('🎉 Produit supprimé avec succès');
        loadProducts();
      } catch (error) {
        toast.error('❌ Erreur lors de la suppression');
      }
    }
  };

  const handleQuickView = (product) => {
    // Implémentez la vue rapide ici
    toast.success(`Vue rapide: ${product.name}`);
  };

  // Filtrage et tri avancés
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      const matchesStock = stockFilter === 'all' ? true :
                          stockFilter === 'in_stock' ? product.stock > 0 :
                          stockFilter === 'low_stock' ? product.stock > 0 && product.stock <= 10 :
                          product.stock === 0;
      
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price_high':
          return b.selling_price - a.selling_price;
        case 'price_low':
          return a.selling_price - b.selling_price;
        case 'stock_high':
          return b.stock - a.stock;
        case 'stock_low':
          return a.stock - b.stock;
        case 'recent':
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return 0;
      }
    });

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Package className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600 animate-pulse">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header avec Statistiques */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-primary-500 to-blue-500 rounded-xl shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Gestion des Produits
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              Gérez votre inventaire et suivez vos performances produits
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </button>
            <button className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Importer
            </button>
            <button
              onClick={handleCreate}
              className="px-6 py-2 bg-gradient-to-r from-primary-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouveau Produit
            </button>
          </div>
        </div>

        {/* Cartes de Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Produits</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalProducts}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Faible</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{lowStockProducts}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rupture</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{outOfStockProducts}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Stock</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {totalProducts - outOfStockProducts}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Barre de Contrôles */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit, catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 backdrop-blur-sm"
              />
            </div>

            {/* Filtres et Contrôles */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Sélecteur de Catégorie */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
              >
                <option value="all">Toutes catégories</option>
                {categories.filter(cat => cat !== 'all').map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Filtre Stock */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
              >
                <option value="all">Tous les stocks</option>
                <option value="in_stock">En stock</option>
                <option value="low_stock">Stock faible</option>
                <option value="out_of_stock">Rupture</option>
              </select>

              {/* Tri */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
              >
                <option value="name">Nom A-Z</option>
                <option value="recent">Plus récent</option>
                <option value="price_high">Prix élevé</option>
                <option value="price_low">Prix bas</option>
                <option value="stock_high">Stock élevé</option>
                <option value="stock_low">Stock faible</option>
              </select>

              {/* Toggle View */}
              <div className="flex bg-white/50 border border-gray-200/50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-primary-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-primary-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grille/Liste des Produits */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onEdit={handleEdit}
                onDelete={handleDelete}
                onQuickView={handleQuickView}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden">
            {filteredProducts.map((product) => (
              <ProductListItem 
                key={product.id} 
                product={product} 
                onEdit={handleEdit}
                onDelete={handleDelete}
                onQuickView={handleQuickView}
              />
            ))}
          </div>
        )}

        {/* État Vide */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50">
            <div className="w-24 h-24 bg-gradient-to-r from-primary-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm ? 'Aucun produit trouvé' : 'Aucun produit disponible'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              {searchTerm 
                ? 'Aucun produit ne correspond à votre recherche. Essayez avec d\'autres termes.'
                : 'Commencez par ajouter votre premier produit à votre catalogue.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreate}
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center mx-auto shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Ajouter le premier produit
              </button>
            )}
          </div>
        )}

        {/* Modal */}
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={editingProduct}
          onSave={loadProducts}
        />
      </div>
    </div>
  );
};

// Composant Carte Produit
const ProductCard = ({ product, onEdit, onDelete, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image du Produit */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {product.image_urls && product.image_urls.length > 0 ? (
          <img
            src={product.image_urls[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {product.discount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
              -{product.discount}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full shadow-lg">
              Rupture
            </span>
          )}
          {product.stock > 0 && product.stock <= 10 && (
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full shadow-lg">
              Stock faible
            </span>
          )}
        </div>

        {/* Actions au survol */}
        <div className={`absolute top-3 right-3 flex flex-col space-y-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}>
          <button
            onClick={() => onQuickView(product)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-primary-500 hover:text-white transition-all duration-300"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(product)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-blue-500 hover:text-white transition-all duration-300"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Informations Produit */}
      <div className="p-5 space-y-3">
        <div className="space-y-2">
          <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary-600">
                {product.selling_price} GDS
              </span>
              {product.discount > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  {Math.round(product.selling_price / (1 - product.discount / 100))} GDS
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3 text-xs text-gray-600">
              <span className={`px-2 py-1 rounded-full ${
                product.stock === 0 ? 'bg-red-100 text-red-700' :
                product.stock <= 10 ? 'bg-orange-100 text-orange-700' :
                'bg-green-100 text-green-700'
              }`}>
                Stock: {product.stock}
              </span>
              <span className="capitalize bg-gray-100 px-2 py-1 rounded-full">
                {product.category}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-500 hover:text-white transition-all duration-300 flex items-center justify-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-500 hover:text-white transition-all duration-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant Ligne Produit (Vue Liste)
const ProductListItem = ({ product, onEdit, onDelete, onQuickView }) => {
  return (
    <div className="group flex items-center p-6 border-b border-gray-200/50 hover:bg-white/50 transition-all duration-300 last:border-b-0">
      {/* Image */}
      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0 mr-6">
        {product.image_urls && product.image_urls.length > 0 ? (
          <img
            src={product.image_urls[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>

      {/* Informations */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        <div className="md:col-span-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-1 mt-1">
            {product.description}
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full capitalize">
              {product.category}
            </span>
            {product.discount > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                -{product.discount}%
              </span>
            )}
          </div>
        </div>

        <div className="text-center">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            product.stock === 0 ? 'bg-red-100 text-red-700' :
            product.stock <= 10 ? 'bg-orange-100 text-orange-700' :
            'bg-green-100 text-green-700'
          }`}>
            {product.stock} unités
          </span>
        </div>

        <div className="text-center">
          <span className="text-lg font-bold text-primary-600">
            {product.selling_price} GDS
          </span>
          {product.discount > 0 && (
            <p className="text-sm text-gray-500 line-through">
              {Math.round(product.selling_price / (1 - product.discount / 100))} GDS
            </p>
          )}
        </div>

        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => onQuickView(product)}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-300"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(product)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Products;