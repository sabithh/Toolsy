// API Client for Toolsy Backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
    token?: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    user_type: 'renter' | 'provider';
    first_name?: string;
    last_name?: string;
    phone?: string;
    profile_image?: string;
    created_at?: string;
    updated_at?: string;
    location_lat?: number;
    location_lng?: number;
    is_verified?: boolean;
    has_shop?: boolean;
    is_superuser?: boolean;
    is_staff?: boolean;
    subscription_status?: 'active' | 'inactive';
    total_bookings?: number;
    total_reviews?: number;
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

    async getMyTools(token: string) {
        return this.request('/api/tools/my_tools/', { token });
    }

    // --- CATEGORIES ---

    // --- TOOLS ---
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

    // Payments
    async createPayment(token: string, bookingId: string) {
        return this.request<{ order_id: string; amount: number; currency: string; key: string }>(
            `/api/bookings/${bookingId}/create_payment/`,
            {
                method: 'POST',
                token,
            }
        );
    }

    async verifyPayment(token: string, bookingId: string, data: { razorpay_payment_id: string; razorpay_signature: string }) {
        return this.request(
            `/api/bookings/${bookingId}/verify_payment/`,
            {
                method: 'POST',
                token,
                body: JSON.stringify(data),
            }
        );
    }

    // Subscriptions
    async createSubscriptionOrder(token: string) {
        return this.request<{ order_id: string; amount: number; key: string; subscription_id: string }>(
            '/api/subscriptions/create_order/',
            {
                method: 'POST',
                token,
            }
        );
    }

    async verifySubscriptionPayment(token: string, data: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
        return this.request(
            '/api/subscriptions/verify_payment/',
            {
                method: 'POST',
                token,
                body: JSON.stringify(data),
            }
        );
    }

    // Admin
    async getAdminStats(token: string) {
        return this.request<any>('/api/admin/stats/', {
            token,
        });
    }

    async getAdminUsers(token: string, search?: string) {
        const query = search ? `?search=${search}` : '';
        return this.request<any>(`/api/admin/users/${query}`, {
            token,
        });
    }

    async getAdminUser(token: string, id: string) {
        return this.request<any>(`/api/admin/users/${id}/`, {
            token,
        });
    }

    async adminToggleVerifyUser(token: string, id: string) {
        return this.request<{ is_verified: boolean }>(`/api/admin/users/${id}/toggle_verify/`, {
            method: 'POST',
            token,
        });
    }

    async adminToggleActiveUser(token: string, id: string) {
        return this.request<{ is_active: boolean }>(`/api/admin/users/${id}/toggle_active/`, {
            method: 'POST',
            token,
        });
    }

    async adminDeleteUser(token: string, id: string) {
        return this.request<void>(`/api/admin/users/${id}/`, {
            method: 'DELETE',
            token,
        });
    }

    async adminGetUserTools(token: string, id: string) {
        return this.request<any[]>(`/api/admin/users/${id}/tools/`, { token });
    }

    async adminGetUserSubscription(token: string, id: string) {
        return this.request<any>(`/api/admin/users/${id}/subscription/`, { token });
    }

    async adminEditSubscription(token: string, id: string, data: { status: string; months?: number }) {
        return this.request<any>(`/api/admin/users/${id}/subscription/edit/`, {
            method: 'PATCH',
            token,
            body: JSON.stringify(data),
        });
    }

    async getAdminBookings(token: string, search?: string) {
        const query = search ? `?search=${search}` : '';
        return this.request<any>(`/api/admin/bookings/${query}`, { token });
    }
}

export const api = new APIClient(API_URL);
