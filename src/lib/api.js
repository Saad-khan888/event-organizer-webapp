const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response. Backend may not be running on ${API_URL}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      // Network errors
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Please ensure the backend is running on http://localhost:5001');
      }
      throw error;
    }
  }

  // Auth
  async signup(userData) {
    const data = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async getUsers() {
    const data = await this.request('/auth/users');
    console.log('🔍 API getUsers response:', data);
    return data;
  }

  async updateProfile(updates) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const headers = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}/upload/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  }

  async deleteAccount() {
    return this.request('/auth/account', {
      method: 'DELETE',
    });
  }

  logout() {
    this.setToken(null);
  }

  // Events
  async getEvents() {
    return this.request('/events');
  }

  async getEvent(id) {
    return this.request(`/events/${id}`);
  }

  async createEvent(eventData) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id, eventData) {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id) {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  async joinEvent(id) {
    return this.request(`/events/${id}/join`, {
      method: 'POST',
    });
  }

  // Reports
  async getReports() {
    return this.request('/reports');
  }

  async getReport(id) {
    return this.request(`/reports/${id}`);
  }

  async createReport(reportData) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async updateReport(id, reportData) {
    return this.request(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reportData),
    });
  }

  async deleteReport(id) {
    return this.request(`/reports/${id}`, {
      method: 'DELETE',
    });
  }

  // Ticketing
  async getTicketTypes(eventId) {
    return this.request(`/ticketing/events/${eventId}/ticket-types`);
  }

  async createTicketType(eventId, data) {
    return this.request(`/ticketing/events/${eventId}/ticket-types`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTicketType(ticketTypeId, data) {
    return this.request(`/ticketing/ticket-types/${ticketTypeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTicketType(ticketTypeId) {
    return this.request(`/ticketing/ticket-types/${ticketTypeId}`, {
      method: 'DELETE',
    });
  }

  async getPaymentMethods(eventId) {
    return this.request(`/ticketing/events/${eventId}/payment-methods`);
  }

  async createPaymentMethod(eventId, data) {
    return this.request(`/ticketing/events/${eventId}/payment-methods`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePaymentMethod(methodId, data) {
    return this.request(`/ticketing/payment-methods/${methodId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePaymentMethod(methodId) {
    return this.request(`/ticketing/payment-methods/${methodId}`, {
      method: 'DELETE',
    });
  }

  async getMyOrders() {
    return this.request('/ticketing/my-orders');
  }

  async getEventOrders(eventId) {
    return this.request(`/ticketing/events/${eventId}/orders`);
  }

  async createOrder(orderData) {
    return this.request('/ticketing/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async submitPaymentProof(orderId, data) {
    return this.request(`/ticketing/orders/${orderId}/submit-payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approvePayment(orderId) {
    return this.request(`/ticketing/orders/${orderId}/approve`, {
      method: 'POST',
    });
  }

  async rejectPayment(orderId, reason) {
    return this.request(`/ticketing/orders/${orderId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getMyTickets() {
    return this.request('/ticketing/my-tickets');
  }

  async getEventTickets(eventId) {
    return this.request(`/ticketing/events/${eventId}/tickets`);
  }

  async validateTicket(qrCode, eventId) {
    return this.request('/ticketing/tickets/validate', {
      method: 'POST',
      body: JSON.stringify({ qr_code: qrCode, event_id: eventId }),
    });
  }
}

export const api = new ApiClient();
