import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  IdCard, 
  Contact, 
  Camera,
  Shield,
  Building,
  Globe,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';

const EditSellerModal = ({ isOpen, onClose, seller, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nif: '',
    passport_number: '',
    profile_picture: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    address: ''
  });

  const [validation, setValidation] = useState({
    name: true,
    email: true,
    emailFormat: true
  });

  useEffect(() => {
    if (seller) {
      setFormData({
        name: seller.name || '',
        email: seller.email || '',
        phone: seller.phone || '',
        nif: seller.nif || '',
        passport_number: seller.passport_number || '',
        profile_picture: seller.profile_picture || '',
        emergency_contact_name: seller.emergency_contact_name || '',
        emergency_contact_phone: seller.emergency_contact_phone || '',
        address: seller.address || ''
      });

      if (seller.profile_picture) {
        setImagePreview({ url: seller.profile_picture, loading: false });
      }
    }
  }, [seller]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newValidation = {
      name: formData.name.length >= 2,
      email: formData.email.length > 0,
      emailFormat: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    };

    setValidation(newValidation);

    if (!Object.values(newValidation).every(Boolean)) {
      toast.error('❌ Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setLoading(true);

    try {
      await adminService.updateSeller(seller.id, formData);
      toast.success('🎉 Vendeur modifié avec succès');
      onSave();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || '❌ Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validation en temps réel
    if (name === 'email') {
      setValidation(prev => ({
        ...prev,
        emailFormat: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value === ''
      }));
    }
    if (name === 'name') {
      setValidation(prev => ({
        ...prev,
        name: value.length >= 2 || value === ''
      }));
    }

    // Mise à jour de la preview d'image
    if (name === 'profile_picture' && value) {
      setImagePreview({ url: value, loading: true });
      // Simuler le chargement
      setTimeout(() => {
        setImagePreview(prev => ({ ...prev, loading: false }));
      }, 1000);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Informations Personnelles', icon: User },
    { id: 'documents', label: 'Documents', icon: IdCard },
    { id: 'emergency', label: 'Contact Urgence', icon: Contact },
    { id: 'address', label: 'Adresse', icon: Building }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl transform animate-scale-in">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Modifier le Vendeur</h2>
                <p className="text-blue-100 opacity-90">
                  Mettez à jour les informations de {seller?.name}
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
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-white text-primary-600 shadow-lg' 
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 max-h-[calc(95vh-200px)] overflow-y-auto">
          {activeTab === 'personal' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Informations Personnelles</h3>
                <p className="text-gray-600">Modifiez les informations de base du vendeur</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2 text-primary-600" />
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                      validation.name 
                        ? 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500' 
                        : 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                    }`}
                    placeholder="Ex: Jean Vendeur"
                  />
                  {!validation.name && (
                    <p className="text-red-600 text-sm mt-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Le nom doit contenir au moins 2 caractères
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-primary-600" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                      validation.emailFormat 
                        ? 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500' 
                        : 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                    }`}
                    placeholder="exemple@business.com"
                  />
                  {!validation.emailFormat && (
                    <p className="text-red-600 text-sm mt-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Format d'email invalide
                    </p>
                  )}
                </div>

                {/* Téléphone */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-primary-600" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>

              {/* Photo de profil */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Camera className="h-4 w-4 mr-2 text-primary-600" />
                  Photo de profil (URL)
                </label>
                <div className="flex items-center space-x-6">
                  <div className="flex-1">
                    <input
                      type="url"
                      name="profile_picture"
                      value={formData.profile_picture}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                      placeholder="https://example.com/profile.jpg"
                    />
                  </div>
                  
                  {/* Preview */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
                      {imagePreview ? (
                        <div className="relative w-full h-full">
                          {imagePreview.loading ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : (
                            <img
                              src={imagePreview.url}
                              alt="Profile preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          )}
                          <div className="hidden w-full h-full items-center justify-center bg-gray-100">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Documents</h3>
                <p className="text-gray-600">Informations légales et documents d'identification</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NIF */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <IdCard className="h-4 w-4 mr-2 text-primary-600" />
                    NIF
                  </label>
                  <input
                    type="text"
                    name="nif"
                    value={formData.nif}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                    placeholder="Numéro d'identification fiscale"
                  />
                  {formData.nif && (
                    <p className="text-green-600 text-sm mt-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      NIF renseigné
                    </p>
                  )}
                </div>

                {/* Passeport */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-primary-600" />
                    Numéro de passeport
                  </label>
                  <input
                    type="text"
                    name="passport_number"
                    value={formData.passport_number}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                    placeholder="Numéro de passeport"
                  />
                  {formData.passport_number && (
                    <p className="text-green-600 text-sm mt-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Passeport renseigné
                    </p>
                  )}
                </div>
              </div>

              {/* Statut de vérification */}
              {(formData.nif || formData.passport_number) && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-6 w-6 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-900">Vendeur vérifié</h4>
                      <p className="text-green-700 text-sm">
                        Ce vendeur dispose des documents nécessaires pour exercer.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'emergency' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Contact d'Urgence</h3>
                <p className="text-gray-600">Personne à contacter en cas d'urgence</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom du contact */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Contact className="h-4 w-4 mr-2 text-primary-600" />
                    Nom du contact
                  </label>
                  <input
                    type="text"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                    placeholder="Nom de la personne à contacter"
                  />
                </div>

                {/* Téléphone du contact */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-primary-600" />
                    Téléphone du contact
                  </label>
                  <input
                    type="tel"
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                    placeholder="Téléphone d'urgence"
                  />
                </div>
              </div>

              {/* Note informative */}
              {(!formData.emergency_contact_name || !formData.emergency_contact_phone) && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-orange-900 mb-2">
                        Contact d'urgence recommandé
                      </h4>
                      <p className="text-sm text-orange-700">
                        Un contact d'urgence complet est recommandé pour assurer la sécurité du vendeur.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'address' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Adresse</h3>
                <p className="text-gray-600">Adresse complète du vendeur</p>
              </div>

              {/* Adresse */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Building className="h-4 w-4 mr-2 text-primary-600" />
                  Adresse complète
                </label>
                <textarea
                  rows={4}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 resize-none"
                  placeholder="Adresse complète incluant rue, ville, code postal..."
                />
                {formData.address && (
                  <p className="text-gray-600 text-sm mt-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {formData.address.length} caractères
                  </p>
                )}
              </div>

              {/* Carte de localisation (placeholder) */}
              {formData.address && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-6 w-6 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Localisation</h4>
                      <p className="text-blue-700 text-sm">
                        L'adresse sera utilisée pour la géolocalisation si nécessaire.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation et Actions */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200">
            <div className="flex space-x-2">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-primary-500 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={tab.label}
                >
                  <tab.icon className="h-4 w-4" />
                </button>
              ))}
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
                    Modification...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer les modifications
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

export default EditSellerModal;