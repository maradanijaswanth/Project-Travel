const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getAuthHeader(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('eximia_token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...(options.headers || {}),
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json.error || `HTTP ${res.status}` };
    }
    return json;
  } catch (err: any) {
    return { success: false, error: err.message || 'Network request failed' };
  }
}

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  register: (data: any) =>
    apiRequest<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () => apiRequest<{ user: any }>('/auth/me'),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('eximia_token');
      localStorage.removeItem('eximia_user');
    }
  },
};

// Journeys API
export const journeyApi = {
  compose: (intent: any) =>
    apiRequest('/journeys/compose', {
      method: 'POST',
      body: JSON.stringify(intent),
    }),
  list: (status?: string) =>
    apiRequest(`/journeys${status ? `?status=${status}` : ''}`),
  getById: (id: string) =>
    apiRequest(`/journeys/${id}`),
  submitReview: (id: string) =>
    apiRequest(`/journeys/${id}/submit-review`, {
      method: 'POST',
    }),
  validate: (id: string, payload: {
    decision: 'APPROVED' | 'REJECTED' | 'CONFIRMED';
    comments?: string;
    slotChecked: boolean;
    pricingChecked: boolean;
    safetyChecked: boolean;
  }) =>
    apiRequest(`/journeys/${id}/validate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// Suppliers API
export const supplierApi = {
  list: (params?: { category?: string; maturity?: string; season?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.maturity) query.append('maturity', params.maturity);
    if (params?.season) query.append('season', params.season);
    if (params?.search) query.append('search', params.search);
    return apiRequest(`/suppliers?${query.toString()}`);
  },
  getById: (id: string) => apiRequest(`/suppliers/${id}`),
  create: (data: any) =>
    apiRequest('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/suppliers/${id}`, {
      method: 'DELETE',
    }),
  addCapability: (supplierId: string, data: any) =>
    apiRequest(`/suppliers/${supplierId}/capabilities`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  addModule: (supplierId: string, data: any) =>
    apiRequest(`/suppliers/${supplierId}/modules`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateModule: (moduleId: string, data: any) =>
    apiRequest(`/modules/${moduleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Knowledge API
export const knowledgeApi = {
  getRoutes: () => apiRequest('/knowledge/routes'),
  getSeasons: () => apiRequest('/knowledge/seasons'),
  getStats: () => apiRequest('/knowledge/stats'),
};

// Customers API
export const customerApi = {
  list: () => apiRequest('/customers'),
  getById: (id: string) => apiRequest(`/customers/${id}`),
};
