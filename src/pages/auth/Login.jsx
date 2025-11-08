import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShoppingCart, Eye, EyeOff, User, Lock, Sparkles, Store, ArrowRight, Shield, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const features = [
    { icon: Shield, text: "Ventes Sécurisées", color: "from-green-500 to-emerald-600" },
    { icon: Zap, text: "Gestion Rapide", color: "from-blue-500 to-cyan-600" },
    { icon: Sparkles, text: "Analyses Avancées", color: "from-purple-500 to-pink-600" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast.success('Connexion réussie ! Bienvenue sur Shay Business');
        const userRole = JSON.parse(localStorage.getItem('user'))?.role;
        navigate(userRole === 'admin' ? '/admin' : '/seller');
      } else {
        toast.error(result.error || 'Erreur de connexion');
      }
    } catch (error) {
      toast.error('Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const FeatureCard = ({ feature, index, isActive }) => (
    <div className={`absolute inset-0 flex items-center space-x-3 p-6 transition-all duration-500 transform ${
      isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
    }`}>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}>
        <feature.icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-white font-semibold text-lg">{feature.text}</p>
        <p className="text-white/80 text-sm">Pour vos ventes personnelles</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute inset-0">
        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Left Section*/}
        <div className="flex flex-col justify-center space-y-8 text-white">
          {/* Logo */}
          <div className="hidden md:flex items-center space-x-4 mb-8">
            {/* <div className="relative">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-slow">
                <img src="https://i.ibb.co/Lhbx4PKX/S-11-6-2025-1.png" alt="Shay" className='h-12 w-12'/>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-yellow-800" />
              </div>
            </div> */}
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-primary-200 bg-clip-text text-transparent">
                SHAY BUSINESS
              </h1>
              <p className="text-gray-300 text-lg">Vos ventes, votre manière</p>
            </div>
          </div>

          {/* Main Heading */}
          <div className="hidden md:block space-y-4">
            <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
              Vendez
              <span className="block bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                Avec Style
              </span>
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              Connectez-vous, gérez, et développez vos ventes en toute simplicité.
            </p>
          </div>

          {/* Animated Features */}
          <div className="relative h-32 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 overflow-hidden hidden md:block">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index}
                feature={feature}
                index={index}
                isActive={index === activeIndex}
              />
            ))}
            {/* Indicator Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex ? 'bg-white w-6' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Section*/}
        <div className="flex items-center justify-center">
          <div 
            className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 transition-all duration-500 hover:bg-white/15 hover:border-white/30"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Form Header */}
            <div className="text-center mb-8">
              <div className='flex items-center justify-center'>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse-slow">
                <img src="https://i.ibb.co/Lhbx4PKX/S-11-6-2025-1.png" alt="Shay" className='h-12 w-12'/>
              </div>
              </div>
              <p className="text-gray-300">Connectez-vous à votre espace personnel</p>
              <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
             
              <div className="group">
                <div className="flex items-center space-x-2 mb-3">
                  <User className="h-4 w-4 text-primary-400" />
                  <label htmlFor="email" className="text-sm font-medium text-gray-300">
                    Votre email
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/10 pl-12"
                    placeholder="votre@email.com"
                    required
                  />
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-hover:text-primary-400 transition-colors" />
                  </div>
                </div>
              </div>

              
              <div className="group">
                <div className="flex items-center space-x-2 mb-3">
                  <Lock className="h-4 w-4 text-primary-400" />
                  <label htmlFor="password" className="text-sm font-medium text-gray-300">
                    Votre mot de passe
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/10 pl-12 pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-hover:text-primary-400 transition-colors" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 p-1"
                  >
                    {showPassword ? 
                      <EyeOff className="h-5 w-5" /> : 
                      <Eye className="h-5 w-5" />
                    }
                  </button>
                </div>
              </div>

             
              <button
                type="submit"
                disabled={loading}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
                      Accéder à Shay
                      <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </button>
            </form>

            
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center space-x-3 text-sm text-gray-300">
                <Shield className="h-4 w-4 text-green-400" />
                <span>Gardez vos informations de connexion privées</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="absolute bottom-8 left-8 flex items-center space-x-4 text-white/60 text-sm">
        <div className="hidden md:flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className=''>Plateforme active</span>
        </div>
      </div>

      <div className="absolute bottom-8 md:right-8 text-white/60 text-sm">
        © 2025 SHAY VENTES • Vente Personnelle
      </div>
    </div>
  );
};

export default Login;
