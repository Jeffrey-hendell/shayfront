import React, { useState, useEffect, useMemo } from "react";
import { 
  X, 
  Plus, 
  Trash2, 
  Search, 
  ShoppingCart, 
  Package, 
  User,
  Mail,
  Phone,
  CreditCard,
  Zap,
  ArrowLeft,
  CheckCircle,
  Loader,
  AlertCircle,
  TrendingUp,
  Shield
} from "lucide-react";
import { productService, saleService } from "../../services/api";
import toast from "react-hot-toast";

const QuickSale = ({ isOpen, onClose, onSaleComplete }) => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Products, 2: Customer, 3: Payment
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      setStep(1);
      setCart([]);
      setCustomer({ name: "", email: "", phone: "" });
      setDiscount(0);
      setNotes("");
    }
  }, [isOpen]);

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data.filter((p) => p.stock > 0));
    } catch (error) {
      toast.error("Erreur lors du chargement des produits");
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.product_id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error("Stock insuffisant");
        return;
      }
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
      toast.success(`Quantité de ${product.name} augmentée`);
    } else {
      if (product.stock < 1) {
        toast.error("Stock insuffisant");
        return;
      }
      setCart([
        ...cart,
        {
          product_id: product.id,
          name: product.name,
          unit_price: product.selling_price * (1 - product.discount / 100),
          quantity: 1,
          max_stock: product.stock,
          image: product.image_urls?.[0]
        },
      ]);
      toast.success(`${product.name} ajouté au panier`);
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (quantity > product.stock) {
      toast.error("Stock insuffisant");
      return;
    }

    setCart(
      cart.map((item) =>
        item.product_id === productId ? { ...item, quantity: quantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    const item = cart.find(item => item.product_id === productId);
    setCart(cart.filter((item) => item.product_id !== productId));
    toast.success(`${item.name} retiré du panier`);
  };

  const calculateSubtotal = () => {
    return cart.reduce(
      (total, item) => total + item.unit_price * item.quantity,
      0
    );
  };

  const calculateDiscountAmount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscountAmount();
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const popularProducts = useMemo(() => {
    return products.filter(p => p.stock > 0).slice(0, 4);
  }, [products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Ajoutez au moins un produit");
      return;
    }

    if (!customer.name.trim()) {
      toast.error("Le nom du client est requis");
      return;
    }

    setLoading(true);
    try {
      await saleService.createSale({
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        items: cart,
        payment_method: paymentMethod,
        discount: discount,
        notes: notes,
        total_amount: calculateTotal()
      });

      toast.success(
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>Vente enregistrée avec succès !</span>
        </div>
      );
      
      setCart([]);
      setCustomer({ name: "", email: "", phone: "" });
      setDiscount(0);
      setNotes("");
      onSaleComplete();
      onClose();
    } catch (error) {
      toast.error(
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span>{error.response?.data?.error || "Erreur lors de la vente"}</span>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { value: "cash", label: "💵 Espèces", color: "bg-green-100 text-green-800" },
    { value: "moncash", label: "📱 Moncash", color: "bg-purple-100 text-purple-800" },
    { value: "natcash", label: "💳 Natcash", color: "bg-blue-100 text-blue-800" },
    { value: "card", label: "💳 Carte bancaire", color: "bg-indigo-100 text-indigo-800" },
    { value: "transfer", label: "🏦 Virement", color: "bg-cyan-100 text-cyan-800" },
    { value: "check", label: "📝 Chèque", color: "bg-orange-100 text-orange-800" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Vente Rapide Express</h2>
              <p className="text-blue-100 text-sm">Transaction en quelques clics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:rotate-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-semibold transition-all duration-300 ${
                  step >= stepNumber 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {step > stepNumber ? <CheckCircle className="h-4 w-4" /> : stepNumber}
                </div>
                <span className={`text-sm font-medium ${
                  step >= stepNumber ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {stepNumber === 1 && 'Produits'}
                  {stepNumber === 2 && 'Client'}
                  {stepNumber === 3 && 'Paiement'}
                </span>
                {stepNumber < 3 && (
                  <div className={`w-12 h-0.5 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex overflow-auto flex-col lg:flex-row">
          {/* Products Panel */}
          {step === 1 && (
            <div className="w-full lg:w-1/2 border-r border-gray-100 flex flex-col">
              <div className="p-6 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un produit ou une catégorie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all duration-200"
                  />
                </div>
              </div>

              {/* Popular Products */}
              {searchTerm === "" && (
                <div className="px-6 pt-4">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
                    Produits Populaires
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {popularProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="flex items-center p-3 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {product.image_urls?.[0] ? (
                            <img
                              src={product.image_urls[0]}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-3 text-left flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-blue-600 font-semibold">
                            {product.selling_price} GDS
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products List */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-3">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-lg transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          {product.image_urls?.[0] ? (
                            <img
                              src={product.image_urls[0]}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-xl"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {product.name}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              product.stock > 10 
                                ? 'bg-green-100 text-green-800'
                                : product.stock > 0
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              Stock: {product.stock}
                            </span>
                            <span className="font-semibold text-blue-600">
                              {product.selling_price} GDS
                            </span>
                            {product.discount > 0 && (
                              <span className="text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold">
                                -{product.discount}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="font-medium">Ajouter</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Step Button */}
              <div className="p-6 border-t border-gray-100">
                <button
                  onClick={() => setStep(2)}
                  disabled={cart.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Continuer vers Client</span>
                  <TrendingUp className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Customer & Payment Panel */}
          {(step === 2 || step === 3) && (
            <div className="w-full lg:w-1/2 flex flex-col">
              {/* Back Button */}
              <div className="p-6 border-b border-gray-100">
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Retour</span>
                </button>
              </div>

              {/* Customer Info - Step 2 */}
              {step === 2 && (
                <div className="flex-1 overflow-y-auto p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <User className="h-6 w-6 text-blue-600 mr-3" />
                    Informations du Client
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du client *
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Nom complet"
                          value={customer.name}
                          onChange={(e) =>
                            setCustomer((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email (optionnel)
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          placeholder="email@exemple.com"
                          value={customer.email}
                          onChange={(e) =>
                            setCustomer((prev) => ({ ...prev, email: e.target.value }))
                          }
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone (optionnel)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          placeholder="+509 XX XX XXXX"
                          value={customer.phone}
                          onChange={(e) =>
                            setCustomer((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (optionnel)
                      </label>
                      <textarea
                        placeholder="Notes supplémentaires sur cette vente..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="3"
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>

                  {/* Next to Payment */}
                  <div className="mt-8">
                    <button
                      onClick={() => setStep(3)}
                      disabled={!customer.name.trim()}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <span>Continuer vers Paiement</span>
                      <CreditCard className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Payment - Step 3 */}
              {step === 3 && (
                <div className="flex-1 overflow-y-auto p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                    Paiement & Validation
                  </h3>

                  {/* Cart Summary */}
                  <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Récapitulatif</h4>
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.product_id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
                              ) : (
                                <Package className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                              <p className="text-sm text-gray-600">{item.quantity} × {item.unit_price} GDS</p>
                            </div>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {(item.unit_price * item.quantity).toFixed(2)} GDS
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sous-total:</span>
                        <span className="font-medium">{calculateSubtotal().toFixed(2)} GDS</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Remise ({discount}%):</span>
                        <span className="text-red-600 font-medium">-{calculateDiscountAmount().toFixed(2)} GDS</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                        <span>Total:</span>
                        <span className="text-blue-600">{calculateTotal().toFixed(2)} GDS</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Méthode de paiement
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.value}
                          onClick={() => setPaymentMethod(method.value)}
                          className={`p-4 border-2 rounded-2xl text-left transition-all duration-200 ${
                            paymentMethod === method.value
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${method.color}`}>
                              {method.label.split(' ')[0]}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {method.label.split(' ').slice(1).join(' ')}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Discount */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remise supplémentaire (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="0"
                    />
                  </div>

                  {/* Finalize Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={loading || cart.length === 0}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Traitement en cours...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5" />
                        <span>Finaliser la vente - {calculateTotal().toFixed(2)} GDS</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Cart Preview - Always visible on right side when in step 1 */}
          {step === 1 && (
            <div className="w-full lg:w-1/2 flex flex-col border-l border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600 mr-2" />
                  Panier ({cart.length})
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Panier vide</p>
                    <p className="text-gray-500 text-sm mt-1">Ajoutez des produits pour continuer</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.product_id}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-xl"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {item.unit_price} GDS × {item.quantity}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2 bg-gray-100 rounded-xl px-2 py-1">
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-medium text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                            >
                              +
                            </button>
                          </div>

                          <span className="font-bold text-gray-900 w-20 text-right text-sm">
                            {(item.unit_price * item.quantity).toFixed(2)} GDS
                          </span>

                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Summary */}
              {cart.length > 0 && (
                <div className="border-t border-gray-100 p-6 bg-gray-50">
                  <div className="space-y-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold text-gray-700">Total:</span>
                      <span className="font-bold text-blue-600 text-xl">
                        {calculateTotal().toFixed(2)} GDS
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickSale;