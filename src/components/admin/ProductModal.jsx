import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  DollarSign, 
  Package, 
  Tag,
  Percent,
  Hash,
  FileText,
  Sparkles,
  Camera,
  Link,
  Trash2,
  Plus,
  Zap
} from 'lucide-react';
import { productService } from '../../services/api';
import toast from 'react-hot-toast';

const ProductModal = ({ isOpen, onClose, product, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [imagePreview, setImagePreview] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'maillot',
    purchase_price: '',
    selling_price: '',
    discount: 0,
    stock: '',
    image_urls: []
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || 'maillot',
        purchase_price: product.purchase_price || '',
        selling_price: product.selling_price || '',
        discount: product.discount || 0,
        stock: product.stock || '',
        image_urls: product.image_urls || []
      });
      // Générer les previews d'images
      if (product.image_urls && product.image_urls.length > 0) {
        setImagePreview(product.image_urls.map(url => ({ url, loading: false })));
      }
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'maillot',
        purchase_price: '',
        selling_price: '',
        discount: 0,
        stock: '',
        image_urls: []
      });
      setImagePreview([]);
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        purchase_price: parseFloat(formData.purchase_price),
        selling_price: parseFloat(formData.selling_price),
        discount: parseFloat(formData.discount),
        stock: parseInt(formData.stock),
        image_urls: Array.isArray(formData.image_urls) ? formData.image_urls : [formData.image_urls]
      };

      if (product) {
        await productService.updateProduct(product.id, data);
        toast.success('🎉 Produit mis à jour avec succès');
      } else {
        await productService.createProduct(data);
        toast.success('🚀 Produit créé avec succès');
      }

      onSave();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || '❌ Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const addImageUrl = () => {
    setFormData(prev => ({
      ...prev,
      image_urls: [...prev.image_urls, '']
    }));
  };

  const updateImageUrl = (index, value) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.map((url, i) => i === index ? value : url)
    }));

    // Mettre à jour la preview
    if (value) {
      const newPreview = [...imagePreview];
      newPreview[index] = { url: value, loading: true };
      setImagePreview(newPreview);
      
      // Simuler le chargement de l'image
      setTimeout(() => {
        const updatedPreview = [...imagePreview];
        updatedPreview[index] = { url: value, loading: false };
        setImagePreview(updatedPreview);
      }, 1000);
    }
  };

  const removeImageUrl = (index) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const calculateProfit = () => {
    const purchase = parseFloat(formData.purchase_price) || 0;
    const selling = parseFloat(formData.selling_price) || 0;
    if (purchase > 0 && selling > 0) {
      return ((selling - purchase) / purchase * 100).toFixed(1);
    }
    return 0;
  };

  const calculateDiscountedPrice = () => {
    const selling = parseFloat(formData.selling_price) || 0;
    const discount = parseFloat(formData.discount) || 0;
    return selling * (1 - discount / 100);
  };

  const categories = [
    { value: 'maillot', label: '👕 Maillot', color: 'from-blue-500 to-cyan-500' },
    { value: 'jean', label: '👖 Jean', color: 'from-indigo-500 to-purple-500' },
    { value: 'tennis', label: '👟 Tennis', color: 'from-green-500 to-emerald-500' },
    { value: 'sandale', label: '🩴 Sandale', color: 'from-orange-500 to-amber-500' },
    { value: 'accessoire', label: '🕶️ Accessoire', color: 'from-pink-500 to-rose-500' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl transform animate-scale-in">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {product ? 'Modifier le produit' : 'Nouveau produit'}
                </h2>
                <p className="text-blue-100 opacity-90">
                  {product ? 'Mettez à jour les informations du produit' : 'Ajoutez un nouveau produit à votre catalogue'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mt-6">
            {['basic', 'pricing', 'images'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-white text-primary-600 shadow-lg' 
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab === 'basic' && '📝 Infos de base'}
                {tab === 'pricing' && '💰 Prix & Stock'}
                {tab === 'images' && '🖼️ Images'}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 max-h-[calc(95vh-200px)] overflow-y-auto">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Name */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-primary-600" />
                  Nom du produit *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 group-hover:border-gray-300"
                  placeholder="Ex: Maillot de football professionnel..."
                />
              </div>

              {/* Description */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-primary-600" />
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 group-hover:border-gray-300 resize-none"
                  placeholder="Décrivez votre produit en détail..."
                />
              </div>

              {/* Category */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-primary-600" />
                  Catégorie *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        formData.category === cat.value
                          ? `border-primary-500 bg-gradient-to-r ${cat.color} text-white shadow-lg`
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium text-center">
                        {cat.label.split(' ')[0]}
                      </div>
                      <div className="text-xs opacity-90 mt-1">
                        {cat.label.split(' ')[1]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Purchase Price */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                    Prix d'achat (GDS) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.purchase_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchase_price: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Selling Price */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
                    Prix de vente (GDS) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.selling_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, selling_price: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Discount */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Percent className="h-4 w-4 mr-2 text-orange-600" />
                    Remise (%)
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Stock */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Hash className="h-4 w-4 mr-2 text-purple-600" />
                    Stock *
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Calculs automatiques */}
              {(formData.purchase_price || formData.selling_price || formData.discount > 0) && (
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6 border border-primary-100">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-primary-600" />
                    Calculs automatiques
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-gray-600">Marge bénéficiaire</div>
                      <div className={`text-lg font-bold ${calculateProfit() > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {calculateProfit()}%
                      </div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-gray-600">Prix après remise</div>
                      <div className="text-lg font-bold text-primary-600">
                        {calculateDiscountedPrice().toFixed(2)} GDS
                      </div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-gray-600">Économie client</div>
                      <div className="text-lg font-bold text-orange-600">
                        {(formData.selling_price - calculateDiscountedPrice()).toFixed(2)} GDS
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
                <div className="flex items-center space-x-3 mb-4">
                  <Camera className="h-5 w-5 text-orange-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Images du produit</h4>
                    <p className="text-sm text-gray-600">Ajoutez des URLs d'images pour présenter votre produit</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {formData.image_urls.map((url, index) => (
                    <div key={index} className="flex space-x-3 items-start">
                      {/* Preview */}
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                        {url ? (
                          <div className="relative w-full h-full">
                            {imagePreview[index]?.loading ? (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                              </div>
                            ) : (
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            )}
                            <div className="hidden w-full h-full items-center justify-center bg-gray-100">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Input */}
                      <div className="flex-1">
                        <div className="flex space-x-2">
                          <div className="relative flex-1">
                            <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="url"
                              value={url}
                              onChange={(e) => updateImageUrl(index, e.target.value)}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImageUrl(index)}
                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-center space-x-2 text-gray-600 group-hover:text-primary-600">
                      <Plus className="h-5 w-5" />
                      <span className="font-medium">Ajouter une image</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Footer */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'basic' ? 'images' : activeTab === 'pricing' ? 'basic' : 'pricing')}
                className="px-4 py-2 text-gray-600 hover:text-primary-600 transition-colors flex items-center"
              >
                <Zap className="h-4 w-4 mr-2" />
                {activeTab === 'basic' ? 'Prix & Stock →' : 
                 activeTab === 'pricing' ? '← Infos de base | Images →' : 
                 '← Prix & Stock'}
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-primary-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none transition-all duration-300 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {product ? 'Modifier le produit' : 'Créer le produit'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;