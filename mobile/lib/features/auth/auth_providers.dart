import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_service.dart';
import '../../core/api/api_client.dart';
import '../../core/models/user.dart';
import '../../core/storage/token_storage.dart';

/// Auth state: null user = logged out; loading = bootstrapping.
class AuthState {
  final AppUser? user;
  final bool loading;
  final String? error;

  const AuthState({this.user, this.loading = false, this.error});

  bool get isAuthenticated => user != null;

  AuthState copyWith({AppUser? user, bool? loading, String? error, bool clearUser = false, bool clearError = false}) =>
      AuthState(
        user: clearUser ? null : (user ?? this.user),
        loading: loading ?? this.loading,
        error: clearError ? null : (error ?? this.error),
      );
}

class AuthController extends StateNotifier<AuthState> {
  final ApiService api;
  final TokenStorage tokens;

  AuthController(this.api, this.tokens) : super(const AuthState(loading: true)) {
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    final access = await tokens.accessToken;
    if (access == null || access.isEmpty) {
      state = const AuthState(loading: false);
      return;
    }
    try {
      final user = await api.getCurrentUser();
      state = AuthState(user: user, loading: false);
    } catch (_) {
      await tokens.clear();
      state = const AuthState(loading: false);
    }
  }

  Future<void> login(String username, String password) async {
    state = state.copyWith(loading: true, clearError: true);
    try {
      final t = await api.login(username, password);
      await tokens.saveTokens(access: t.access, refresh: t.refresh);
      final user = await api.getCurrentUser();
      state = AuthState(user: user, loading: false);
    } catch (e) {
      state = AuthState(loading: false, error: VaadakaApiClient.describeError(e));
      rethrow;
    }
  }

  Future<void> register({
    required String username,
    required String email,
    required String password,
    required String userType,
    String? firstName,
    String? lastName,
    String? phone,
  }) async {
    state = state.copyWith(loading: true, clearError: true);
    try {
      await api.register({
        'username': username,
        'email': email,
        'password': password,
        'password_confirm': password,
        'user_type': userType,
        if (firstName != null && firstName.isNotEmpty) 'first_name': firstName,
        if (lastName != null && lastName.isNotEmpty) 'last_name': lastName,
        if (phone != null && phone.isNotEmpty) 'phone': phone,
      });
      // Auto-login after register
      await login(username, password);
    } catch (e) {
      state = AuthState(loading: false, error: VaadakaApiClient.describeError(e));
      rethrow;
    }
  }

  Future<void> logout() async {
    await tokens.clear();
    state = const AuthState();
  }

  Future<void> refreshMe() async {
    if (state.user == null) return;
    try {
      final user = await api.getCurrentUser();
      state = state.copyWith(user: user);
    } catch (_) {}
  }
}

final authProvider = StateNotifierProvider<AuthController, AuthState>((ref) {
  return AuthController(ref.watch(apiServiceProvider), ref.watch(tokenStorageProvider));
});
