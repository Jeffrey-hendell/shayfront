import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/Dashboard';
import SellerDashboard from './pages/seller/Dashboard';
import Products from './pages/admin/Products';
import Sellers from './pages/admin/Sellers';
import Sales from './pages/admin/Sales';
import Reports from './pages/admin/Reports';
import SellerSales from './pages/seller/Sales';
import SellerProducts from './pages/seller/Products';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin/products" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <Products />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/sellers" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <Sellers />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/sales" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <Sales />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/seller" element={
          <ProtectedRoute allowedRoles={['seller', 'admin']}>
            <Layout>
              <SellerDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/seller/sales" element={
          <ProtectedRoute allowedRoles={['seller', 'admin']}>
            <Layout>
              <SellerSales />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/seller/products" element={
          <ProtectedRoute allowedRoles={['seller', 'admin']}>
            <Layout>
              <SellerProducts />
            </Layout>
          </ProtectedRoute>
        } />

        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;