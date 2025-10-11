import api from './api';

// Auth services
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data)
};

// Game services
export const gameService = {
  getGames: (params = {}) => api.get('/games', { params }),
  getGameBySlug: (slug) => api.get(`/games/${slug}`),
  createGame: (data) => api.post('/games', data),
  updateGame: (id, data) => api.put(`/games/${id}`, data),
  deleteGame: (id) => api.delete(`/games/${id}`),
  getGameReviews: (id, params = {}) => api.get(`/games/${id}/reviews`, { params }),
  addGameReview: (id, data) => api.post(`/games/${id}/reviews`, data)
};

// Order services
export const orderService = {
  createOrder: (data) => api.post('/orders', data),
  getUserOrders: (params = {}) => api.get('/orders/me', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  getAllOrders: (params = {}) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data)
};

// Review services
export const reviewService = {
  addReview: (gameId, data) => api.post(`/games/${gameId}/reviews`, data),
  getReviews: (gameId, params = {}) => api.get(`/games/${gameId}/reviews`, { params })
};

// Upload services
export const uploadService = {
  uploadSingle: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  uploadMultiple: (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};