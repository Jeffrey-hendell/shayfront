import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp,
  DollarSign,
  Plus
} from 'lucide-react';
import { saleService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import QuickSale from '../../components/seller/QuickSale';

const SellerDashboard = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuickSale, setShowQuickSale] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const data = await saleService.getMySales();
      setSales(data);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const todaySales = sales.filter(sale => 
    new Date(sale.created_at).toDateString() === new Date().toDateString()
  );

  const todayRevenue = todaySales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Nouvelle vente',
      description: 'Enregistrer une nouvelle vente',
      icon: Plus,
      onClick: () => setShowQuickSale(true),
      color: 'primary'
    },
    {
      title: 'Voir les produits',
      description: 'Consulter le catalogue',
      icon: Package,
      href: '/seller/products',
      color: 'success'
    },
    {
      title: 'Historique des ventes',
      description: 'Voir toutes mes ventes',
      icon: ShoppingCart,
      href: '/seller/sales',
      color: 'warning'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900">Tableau de bord Vendeur</h1>
          <p className="text-gray-600 mt-2">
            Aperçu de votre activité aujourd'hui
          </p>
        </div>
        
        <button
          onClick={() => setShowQuickSale(true)}
          className="btn btn-primary mt-4 sm:mt-0 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvelle vente
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Ventes aujourd'hui"
          value={todaySales.length}
          icon={ShoppingCart}
          trend={12.5}
          trendDirection="up"
          color="primary"
        />
        <StatCard
          title="CA aujourd'hui"
          value={`${todayRevenue} GDS`}
          icon={DollarSign}
          trend={8.2}
          trendDirection="up"
          color="success"
        />
        <StatCard
          title="Ventes totales"
          value={sales.length}
          icon={TrendingUp}
          trend={15.7}
          trendDirection="up"
          color="warning"
        />
      </div>

      {/* Quick Actions and Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="space-y-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              if (action.href) {
                return (
                  <Link
                    key={index}
                    to={action.href}
                    className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg bg-${action.color}-100`}>
                        <Icon className={`h-6 w-6 text-${action.color}-600`} />
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900">{action.title}</h4>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              }
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="block w-full text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg bg-${action.color}-100`}>
                      <Icon className={`h-6 w-6 text-${action.color}-600`} />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium text-gray-900">{action.title}</h4>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ventes récentes
            </h3>
            <div className="space-y-4">
              {sales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Facture #{sale.invoice_number}</p>
                    <p className="text-sm text-gray-600">{sale.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-600">{sale.total_amount} GDS</p>
                    <p className="text-sm text-gray-500">
                      {new Date(sale.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
              
              {sales.length === 0 && (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune vente enregistrée</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Sale Modal */}
      <QuickSale
        isOpen={showQuickSale}
        onClose={() => setShowQuickSale(false)}
        onSaleComplete={loadSales}
      />
    </div>
  );
};

export default SellerDashboard;