import React, { useState } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  IdCard, 
  Shield, 
  Contact, 
  Camera,
  Sparkles,
  Zap,
  CheckCircle,
  AlertCircle,
  Key,
  Globe,
  Building
} from 'lucide-react';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';

const SellerModal = ({ isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
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
    password: true,
    emailFormat: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation avancée
    const newValidation = {
      name: formData.name.length >= 2,
      email: formData.email.length > 0,
      password: formData.password.length >= 6,
      emailFormat: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    };

    setValidation(newValidation);

    if (!Object.values(newValidation).every(Boolean)) {
      toast.error('❌ Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setLoading(true);

    try {
      await adminService.createSeller(formData);
      toast.success('🎉 Vendeur créé avec succès !');
      resetForm();
      onSave();
      onClose();
    } catch (error) {
      console.error('Error creating seller:', error);
      toast.error(error.response?.data?.error || '❌ Erreur lors de la création du vendeur');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      nif: '',
      passport_number: '',
      profile_picture: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      address: ''
    });
    setActiveStep(1);
    setValidation({
      name: true,
      email: true,
      password: true,
      emailFormat: true
    });
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
    if (name === 'password') {
      setValidation(prev => ({
        ...prev,
        password: value.length >= 6 || value === ''
      }));
    }
    if (name === 'name') {
      setValidation(prev => ({
        ...prev,
        name: value.length >= 2 || value === ''
      }));
    }
  };

  const nextStep = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const steps = [
    { number: 1, title: 'Informations de base', icon: User },
    { number: 2, title: 'Documents & Contact', icon: IdCard },
    { number: 3, title: 'Confirmation', icon: CheckCircle }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl transform animate-scale-in">
        {/* Header avec étapes */}
        <div className="relative bg-gradient-to-r from-primary-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Nouveau Vendeur</h2>
                <p className="text-blue-100 opacity-90">
                  Ajoutez un nouveau membre à votre équipe commerciale
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

          {/* Barre de progression */}
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = step.number < activeStep;
              const isActive = step.number === activeStep;
              
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-white text-primary-600 border-white' 
                      : isActive 
                      ? 'bg-white text-primary-600 border-white shadow-lg' 
                      : 'bg-transparent text-blue-200 border-blue-200'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className={`ml-3 flex-1 ${index === steps.length - 1 ? 'hidden' : 'block'}`}>
                    <div className={`h-1 rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-white' : 'bg-blue-200'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 max-h-[calc(95vh-200px)] overflow-y-auto">
          {activeStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Informations de Base</h3>
                <p className="text-gray-600">Renseignez les informations principales du vendeur</p>
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

                {/* Mot de passe */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Key className="h-4 w-4 mr-2 text-primary-600" />
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 pr-12 ${
                        validation.password 
                          ? 'border-gray-200 focus:ring-primary-500/20 focus:border-primary-500' 
                          : 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                      }`}
                      placeholder="Minimum 6 caractères"
                      minLength="6"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {!validation.password && (
                    <p className="text-red-600 text-sm mt-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Le mot de passe doit contenir au moins 6 caractères
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
                <div className="flex items-center space-x-4">
                  <input
                    type="url"
                    name="profile_picture"
                    value={formData.profile_picture}
                    onChange={handleChange}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                    placeholder="https://example.com/profile.jpg"
                  />
                  {formData.profile_picture && (
                    <div className="w-16 h-16 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                      <img
                        src={formData.profile_picture}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-full h-full items-center justify-center bg-gray-100">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Documents & Contact</h3>
                <p className="text-gray-600">Informations supplémentaires et contact d'urgence</p>
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
                </div>

                {/* Contact d'urgence */}
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

              {/* Adresse */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Building className="h-4 w-4 mr-2 text-primary-600" />
                  Adresse
                </label>
                <textarea
                  rows={3}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 resize-none"
                  placeholder="Adresse complète..."
                />
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmation</h3>
                <p className="text-gray-600">Vérifiez les informations avant de créer le vendeur</p>
              </div>

              {/* Récapitulatif */}
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6 border border-primary-100">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-primary-600" />
                  Récapitulatif du vendeur
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nom:</span>
                      <span className="font-medium text-gray-900">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Téléphone:</span>
                      <span className="font-medium text-gray-900">{formData.phone || 'Non renseigné'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">NIF:</span>
                      <span className="font-medium text-gray-900">{formData.nif || 'Non renseigné'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact urgence:</span>
                      <span className="font-medium text-gray-900">{formData.emergency_contact_name || 'Non renseigné'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note d'information */}
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                <div className="flex items-start space-x-3">
                  <Zap className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-orange-900 mb-2">
                      Information importante
                    </h4>
                    <p className="text-sm text-orange-700">
                      Le vendeur pourra se connecter immédiatement avec l'email et le mot de passe fournis.
                      Aucun email de notification ne sera envoyé automatiquement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200">
            <div>
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
                >
                  ← Précédent
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
              >
                Annuler
              </button>
              
              {activeStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center"
                >
                  Suivant →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none transition-all duration-300 flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Création...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Créer le vendeur
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerModal;