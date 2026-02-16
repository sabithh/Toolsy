// API Client for Toolsy Backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
    token?: string;
}

class APIClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async request<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<T> {
        const { token, ...fetchOptions } = options;

        const isFormData = fetchOptions.body instanceof FormData;

        const headers: Record<string, string> = {
            ...(fetchOptions.headers as Record<string, string>),
        };

        if (!isFormData && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...fetchOptions,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Request failed' }));
            const errorMessage = error.detail || JSON.stringify(error); // Capture full validation errors
            throw new Error(errorMessage || `HTTP ${response.status}`);
        }

        return response.json();
    }

    // Auth
    async login(username: string, password: string) {
        return this.request<{ access: string; refresh: string }>('/api/auth/token/', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    }

    async register(data: any) {
        return this.request('/api/users/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async refreshToken(refresh: string) {
        return this.request<{ access: string }>('/api/auth/token/refresh/', {
            method: 'POST',
            body: JSON.stringify({ refresh }),
        });
    }

    // User
    async getCurrentUser(token: string) {
        return this.request('/api/users/me/', { token });
    }

    async updateProfile(token: string, data: any) {
        return this.request('/api/users/update_profile/', {
            method: 'PATCH',
            token,
            body: JSON.stringify(data),
        });
    }

    // Shops
    async getShops(params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request(`/api/shops/${query}`);
    }

    async getNearbyShops(lat: number, lng: number, radius = 10) {
        return this.request(`/api/shops/nearby/?lat=${lat}&lng=${lng}&radius=${radius}`);
    }

    async getShop(id: string) {
        return this.request(`/api/shops/${id}/`);
    }

    async createShop(token: string, data: any) {
        return this.request('/api/shops/', {
            method: 'POST',
            token,
            body: JSON.stringify(data),
        });
    }

    async getMyShops(token: string) {
        return this.request<any[]>('/api/shops/my_shops/', { token });
    }

    async updateShop(token: string, id: string, data: any) {
        return this.request(`/api/shops/${id}/`, {
            method: 'PATCH',
            token,
            body: JSON.stringify(data),
        });
    }

    // Tools
    async getCategories() {
        return this.request('/api/categories/');
    }

    async getTools(params?: Record<string, string>) {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        return this.request(`/api/tools/${query}`);
    }

    async getNearbyTools(lat: number, lng: number, radius = 10) {
        return this.request(`/api/tools/nearby/?lat=${lat}&lng=${lng}&radius=${radius}`);
    }

    async getTool(id: string) {
        return this.request(`/api/tools/${id}/`);
    }

    async createTool(token: string, data: any) {
        // Handle multipart/form-data for image uploads if needed, 
        // but often JSON is fine if images are handled separately or base64. 
        // Assuming JSON for now based on standard REST usage here, 
        // but if data contains File objects, we might need FormData.
        const isFormData = data instanceof FormData;

        return this.request('/api/tools/', {
            method: 'POST',
            token,
            body: isFormData ? data : JSON.stringify(data),
            // fetch automatically sets Content-Type to multipart/form-data if body is FormData
            // so we only set application/json if it's not FormData
            headers: isFormData ? {} : { 'Content-Type': 'application/json' }
        });
    }

    async updateTool(token: string, id: string, data: any) {
        const isFormData = data instanceof FormData;
        return this.request(`/api/tools/${id}/`, {
            method: 'PATCH',
            token,
            body: isFormData ? data : JSON.stringify(data),
            headers: isFormData ? {} : { 'Content-Type': 'application/json' }
        });
    }

    async deleteTool(token: string, id: string) {
        return this.request(`/api/tools/${id}/`, {
            method: 'DELETE',
            token,
        });
    }



    // Bookings
    async getBookings(token: string) {
        return this.request('/api/bookings/', { token });
    }

    async createBooking(token: string, data: any) {
        return this.request('/api/bookings/', {
            method: 'POST',
            token,
            body: JSON.stringify(data),
        });
    }

    async confirmBooking(token: string, id: string) {
        return this.request(`/api/bookings/${id}/confirm/`, {
            method: 'POST',
            token,
        });
    }

    async cancelBooking(token: string, id: string) {
        return this.request(`/api/bookings/${id}/cancel/`, {
            method: 'POST',
            token,
        });
    }
}

export const api = new APIClient(API_URL);
