/// Backend API configuration.
class ApiConfig {
  ApiConfig._();

  /// Production backend URL. Matches the web app's NEXT_PUBLIC_API_URL.
  static const String baseUrl = 'https://toolsy-api.duckdns.org';

  // If you need to point at a different env (local/staging), change it here
  // or thread it through via --dart-define at build time.
  // Example:
  //   flutter run --dart-define=API_URL=http://10.0.2.2:8000
  static String resolvedBaseUrl = const String.fromEnvironment('API_URL', defaultValue: baseUrl);
}
