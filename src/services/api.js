import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }).then(res => res.data),
  
  getProfile: () => 
    api.get('/auth/profile').then(res => res.data.user),
};

export const adminService = {
  getStats: (period) => 
    api.get(`/admin/stats/${period}`).then(res => res.data),
  
  getSellers: () => 
    api.get('/admin/sellers').then(res => res.data.sellers),
  
  createSeller: (sellerData) => 
    api.post('/admin/sellers', sellerData).then(res => res.data),
  
  toggleSellerStatus: (id, isActive) => 
    api.patch(`/admin/sellers/${id}/status`, { is_active: isActive }).then(res => res.data),

    getSellerStats: () => 
    api.get('/admin/stats/sellers/performance').then(res => res.data),
   
    getCategoryStats: () => 
    api.get('/admin/stats/categories').then(res => res.data),

  getSellerDetails: (id) => 
    api.get(`/admin/sellers/${id}`).then(res => res.data.seller),
  
  updateSeller: (id, sellerData) => 
    api.put(`/admin/sellers/${id}`, sellerData).then(res => res.data),
  
  getSaleDetails: (id) => 
    api.get(`/sales/${id}`).then(res => res.data.sale),
  
  updateSale: (id, saleData) => 
    api.put(`/sales/${id}`, saleData).then(res => res.data),
  
  deleteSale: (id) => 
    api.delete(`/sales/${id}`).then(res => res.data),
  
  // exportExcel: () => 
  //   api.get('/admin/export/excel', { responseType: 'blob' }),

    exportExcel: () => 
    api.get('/reports/sales/excel', { 
      responseType: 'blob',
      timeout: 30000 // 30 secondes timeout
    }),

  exportDashboardExcel: () => 
    api.get('/admin/export/dashboard', { responseType: 'blob' }),

};


export const exportService = {
  // Export Excel
  exportSalesExcel: (period = 'month') =>
    api.get(`/admin/export/excel/sales?period=${period}`, { responseType: 'blob' }),
  
  exportProductsExcel: () =>
    api.get('/admin/export/excel/products', { responseType: 'blob' }),
  
  exportSellersExcel: () =>
    api.get('/admin/export/excel/sellers', { responseType: 'blob' }),
  
  exportFullExcel: () =>
    api.get('/admin/export/excel/full', { responseType: 'blob' }),

  // Export PDF
  exportSalesPDF: (period = 'month') =>
    api.get(`/admin/export/pdf/sales?period=${period}`, { responseType: 'blob' }),
  
  exportProductsPDF: () =>
    api.get('/admin/export/pdf/products', { responseType: 'blob' }),
  
  exportSellersPDF: () =>
    api.get('/admin/export/pdf/sellers', { responseType: 'blob' }),
};


export const productService = {
  getProducts: () => 
    api.get('/products').then(res => res.data.products),
  
  createProduct: (productData) => 
    api.post('/products', productData).then(res => res.data),
  
  updateProduct: (id, productData) => 
    api.put(`/products/${id}`, productData).then(res => res.data),
  
  deleteProduct: (id) => 
    api.delete(`/products/${id}`).then(res => res.data),
};


export const saleService = {
  getSales: () => 
    api.get('/sales').then(res => res.data.sales),
  
  getMySales: () => 
    api.get('/sales/my-sales').then(res => res.data.sales),
  
  createSale: (saleData) => 
    api.post('/sales', saleData).then(res => res.data),

  getSaleDetails: (id) => 
    api.get(`/sales/${id}`).then(res => res.data.sale),

  generateInvoice: (id) => 
    api.get(`/sales/${id}/invoice`, { responseType: 'blob' }),
};



export default api;