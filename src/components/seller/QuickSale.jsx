import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Search, ShoppingCart, Package } from "lucide-react";
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

  useEffect(() => {
    if (isOpen) {
      loadProducts();
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
        },
      ]);
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
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + item.unit_price * item.quantity,
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Ajoutez au moins un produit");
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
      });

      toast.success("Vente enregistrée avec succès !");
      setCart([]);
      setCustomer({ name: "", email: "", phone: "" });
      onSaleComplete();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de la vente");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Nouvelle vente rapide
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-auto flex-col md:flex-row">
          {/* Products Panel */}
          <div className="w-full md:w-1/2 border-r border-gray-200 flex flex-col order-2 md:order-1">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 gap-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-center justify-between flex-row">
                      <div className="w-auto rounded-lg">
                        {product.image_urls && product.image_urls.length > 0 ? (
                          <img
                            src={product.image_urls[0]}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      <div className="px-2">
                        <h4 className="font-medium text-gray-900">
                        {product.name}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Stock: {product.stock}</span>
                        <span>{product.selling_price} GDS</span>
                        {product.discount > 0 && (
                          <span className="text-danger-600">
                            -{product.discount}%
                          </span>
                        )}
                      </div>
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="btn btn-primary text-sm"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Panel */}
          <div className="w-full md:w-1/2 flex flex-col order-1 md:order-2">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informations client
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  placeholder="Nom du client *"
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="input"
                  required
                />
                <input
                  type="email"
                  placeholder="Email (optionnel)"
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="input"
                />
                <input
                  type="tel"
                  placeholder="Téléphone (optionnel)"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="input"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Panier
              </h3>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun produit dans le panier</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {item.unit_price} GDS l'unité
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.product_id, item.quantity - 1)
                            }
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product_id, item.quantity + 1)
                            }
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-semibold w-20 text-right">
                          {(item.unit_price * item.quantity).toFixed(2)} GDS
                        </span>

                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="p-1 text-gray-400 hover:text-danger-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary-600">
                  {calculateTotal().toFixed(2)} GDS
                </span>
              </div>

              <div className="space-y-4">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="input"
                >
                  <option value="cash">Espèces</option>
                  <option value="moncash">Moncash</option>
                  <option value="natcash">Natcash</option>
                  <option value="card">Carte bancaire</option>
                  <option value="transfer">Virement</option>
                  <option value="check">Chèque</option>
                  <option value="paypal">Paypal</option>
                  <option value="stripe">Stripe</option>
                </select>

                <button
                  onClick={handleSubmit}
                  disabled={loading || cart.length === 0}
                  className="w-full btn btn-primary py-3"
                >
                  {loading
                    ? "Traitement..."
                    : `Valider la vente - ${calculateTotal().toFixed(2)} GDS`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSale;
