import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../storage/token_storage.dart';
import 'api_config.dart';

/// Dio HTTP client with JWT attach + auto-refresh on 401.
class VaadakaApiClient {
  final Dio dio;
  final TokenStorage tokens;

  VaadakaApiClient._(this.dio, this.tokens);

  factory VaadakaApiClient({TokenStorage? storage}) {
    final tokens = storage ?? TokenStorage();
    final dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.resolvedBaseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 20),
        sendTimeout: const Duration(seconds: 30),
        responseType: ResponseType.json,
        contentType: 'application/json',
        headers: {'Accept': 'application/json'},
      ),
    );

    dio.interceptors.add(_AuthInterceptor(dio: dio, tokens: tokens));
    return VaadakaApiClient._(dio, tokens);
  }

  /// Extract a human-readable message from a DioException.
  static String describeError(Object e) {
    if (e is DioException) {
      final res = e.response;
      if (res != null) {
        final data = res.data;
        if (data is Map) {
          if (data['detail'] != null) {
            final detail = data['detail'].toString();
            // Translate generic SimpleJWT / Django auth messages to friendly copy
            if (detail.toLowerCase().contains('no active account') ||
                detail.toLowerCase().contains('given credentials')) {
              return 'Incorrect username or password.';
            }
            if (detail.toLowerCase().contains('token is invalid') ||
                detail.toLowerCase().contains('token is expired')) {
              return 'Session expired. Please sign in again.';
            }
            return detail;
          }
          // Collect field errors
          final parts = <String>[];
          data.forEach((k, v) {
            if (v is List && v.isNotEmpty) {
              parts.add('${k.toString()}: ${v.first}');
            } else if (v is String) {
              parts.add('$k: $v');
            }
          });
          if (parts.isNotEmpty) return parts.join('\n');
        }
        if (data is String && data.isNotEmpty) return data;
        return 'Request failed (${res.statusCode})';
      }
      if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.sendTimeout) {
        return 'Request timed out. Check your connection.';
      }
      if (e.type == DioExceptionType.connectionError) {
        return 'Could not reach server. Check your internet.';
      }
      return e.message ?? 'Network error';
    }
    return e.toString();
  }
}

class _AuthInterceptor extends Interceptor {
  final Dio dio;
  final TokenStorage tokens;
  bool _refreshing = false;

  _AuthInterceptor({required this.dio, required this.tokens});

  @override
  Future<void> onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    // Don't attach bearer to auth endpoints themselves
    final path = options.path;
    final skip = path.contains('/auth/token/') || options.extra['skipAuth'] == true;
    if (!skip) {
      final token = await tokens.accessToken;
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    }
    handler.next(options);
  }

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    final res = err.response;
    final reqPath = err.requestOptions.path;
    final isAuthCall = reqPath.contains('/auth/token/');

    if (res?.statusCode == 401 && !isAuthCall && !_refreshing) {
      _refreshing = true;
      try {
        final refresh = await tokens.refreshToken;
        if (refresh == null || refresh.isEmpty) {
          await tokens.clear();
          _refreshing = false;
          return handler.next(err);
        }
        final r = await dio.post(
          '/api/auth/token/refresh/',
          data: {'refresh': refresh},
          options: Options(extra: {'skipAuth': true}),
        );
        final newAccess = r.data['access'] as String?;
        if (newAccess == null) throw Exception('No access token in refresh response');
        await tokens.updateAccess(newAccess);

        // Retry original request with new token
        final retryOpts = err.requestOptions;
        retryOpts.headers['Authorization'] = 'Bearer $newAccess';
        final response = await dio.fetch(retryOpts);
        _refreshing = false;
        return handler.resolve(response);
      } catch (_) {
        await tokens.clear();
        _refreshing = false;
        return handler.next(err);
      }
    }
    handler.next(err);
  }
}

// ─── Riverpod providers ───
final tokenStorageProvider = Provider<TokenStorage>((ref) => TokenStorage());
final apiClientProvider = Provider<VaadakaApiClient>((ref) {
  return VaadakaApiClient(storage: ref.watch(tokenStorageProvider));
});
