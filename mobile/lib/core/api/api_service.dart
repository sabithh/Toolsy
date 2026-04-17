import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/tool.dart';
import '../models/user.dart';
import 'api_client.dart';

/// Single service facade for all backend endpoints.
class ApiService {
  final VaadakaApiClient client;
  Dio get _dio => client.dio;

  ApiService(this.client);

  // ─── AUTH ───
  Future<({String access, String refresh})> login(String username, String password) async {
    final r = await _dio.post('/api/auth/token/', data: {'username': username, 'password': password});
    return (access: r.data['access'] as String, refresh: r.data['refresh'] as String);
  }

  Future<void> register(Map<String, dynamic> data) async {
    await _dio.post('/api/users/', data: data);
  }

  Future<AppUser> getCurrentUser() async {
    final r = await _dio.get('/api/users/me/');
    return AppUser.fromJson(Map<String, dynamic>.from(r.data));
  }

  Future<AppUser> updateMe(Map<String, dynamic> patch) async {
    final r = await _dio.patch('/api/users/me/', data: patch);
    return AppUser.fromJson(Map<String, dynamic>.from(r.data));
  }

  // ─── TOOLS ───
  Future<List<Tool>> listTools({String? search, String? categoryId, String? ordering}) async {
    final params = <String, dynamic>{};
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (categoryId != null && categoryId.isNotEmpty) params['category'] = categoryId;
    if (ordering != null) params['ordering'] = ordering;
    final r = await _dio.get('/api/tools/', queryParameters: params);
    final data = r.data;
    final list = data is List ? data : (data['results'] as List? ?? []);
    return list.map((e) => Tool.fromJson(Map<String, dynamic>.from(e))).toList();
  }

  Future<Tool> getTool(String id) async {
    final r = await _dio.get('/api/tools/$id/');
    return Tool.fromJson(Map<String, dynamic>.from(r.data));
  }

  Future<List<Map<String, dynamic>>> listCategories() async {
    final r = await _dio.get('/api/categories/');
    final list = r.data is List ? r.data : (r.data['results'] as List? ?? []);
    return list.map<Map<String, dynamic>>((e) => Map<String, dynamic>.from(e)).toList();
  }

  // ─── BOOKINGS ───
  Future<List<Booking>> listBookings({String? status}) async {
    final params = <String, dynamic>{};
    if (status != null && status.isNotEmpty) params['status'] = status;
    final r = await _dio.get('/api/bookings/', queryParameters: params);
    final list = r.data is List ? r.data : (r.data['results'] as List? ?? []);
    return list.map((e) => Booking.fromJson(Map<String, dynamic>.from(e))).toList();
  }

  Future<Booking> createBooking(Map<String, dynamic> data) async {
    final r = await _dio.post('/api/bookings/', data: data);
    return Booking.fromJson(Map<String, dynamic>.from(r.data));
  }

  Future<Booking> getBooking(String id) async {
    final r = await _dio.get('/api/bookings/$id/');
    return Booking.fromJson(Map<String, dynamic>.from(r.data));
  }

  Future<Booking> confirmBooking(String id) async {
    final r = await _dio.post('/api/bookings/$id/confirm/');
    return Booking.fromJson(Map<String, dynamic>.from(r.data));
  }

  Future<Booking> cancelBooking(String id) async {
    final r = await _dio.post('/api/bookings/$id/cancel/');
    return Booking.fromJson(Map<String, dynamic>.from(r.data));
  }

  Future<Map<String, dynamic>> createPaymentOrder(String bookingId) async {
    final r = await _dio.post('/api/bookings/$bookingId/create_payment/');
    return Map<String, dynamic>.from(r.data);
  }

  Future<void> verifyPayment({
    required String bookingId,
    required String razorpayPaymentId,
    required String razorpaySignature,
  }) async {
    await _dio.post('/api/bookings/$bookingId/verify_payment/', data: {
      'razorpay_payment_id': razorpayPaymentId,
      'razorpay_signature': razorpaySignature,
    });
  }

  // ─── CHAT ───
  Future<List<ChatRoomSummary>> listChatRooms() async {
    final r = await _dio.get('/api/chats/');
    final list = r.data is List ? r.data : (r.data['results'] as List? ?? []);
    return list.map((e) => ChatRoomSummary.fromJson(Map<String, dynamic>.from(e))).toList();
  }

  Future<Map<String, dynamic>> getChatRoom(String bookingId) async {
    final r = await _dio.get('/api/chats/$bookingId/');
    return Map<String, dynamic>.from(r.data);
  }

  Future<List<ChatMessage>> listMessages(String bookingId) async {
    final r = await _dio.get('/api/chats/$bookingId/messages/');
    final list = r.data is List ? r.data : (r.data['results'] as List? ?? []);
    return list.map((e) => ChatMessage.fromJson(Map<String, dynamic>.from(e))).toList();
  }

  Future<ChatMessage> sendMessage(String bookingId, String text) async {
    final r = await _dio.post('/api/chats/$bookingId/messages/', data: {'message': text});
    return ChatMessage.fromJson(Map<String, dynamic>.from(r.data));
  }

  // ─── SHOPS & PROVIDER ───
  Future<List<Map<String, dynamic>>> myShops() async {
    final r = await _dio.get('/api/shops/');
    final list = r.data is List ? r.data : (r.data['results'] as List? ?? []);
    return list.map<Map<String, dynamic>>((e) => Map<String, dynamic>.from(e)).toList();
  }

  Future<Map<String, dynamic>> createShop(Map<String, dynamic> data) async {
    final r = await _dio.post('/api/shops/', data: data);
    return Map<String, dynamic>.from(r.data);
  }

  Future<Tool> createTool(Map<String, dynamic> data) async {
    final r = await _dio.post('/api/tools/', data: data);
    return Tool.fromJson(Map<String, dynamic>.from(r.data));
  }

  Future<void> uploadToolImage({required String toolId, required String filePath}) async {
    final form = FormData.fromMap({
      'tool': toolId,
      'image': await MultipartFile.fromFile(filePath),
    });
    await _dio.post('/api/tool-images/', data: form);
  }

  // ─── NOTIFICATIONS ───
  Future<List<Map<String, dynamic>>> listNotifications() async {
    final r = await _dio.get('/api/notifications/');
    final list = r.data is List ? r.data : (r.data['results'] as List? ?? []);
    return list.map<Map<String, dynamic>>((e) => Map<String, dynamic>.from(e)).toList();
  }

  Future<void> markNotificationRead(String id) async {
    await _dio.post('/api/notifications/$id/mark_read/');
  }

  Future<void> markAllNotificationsRead() async {
    await _dio.post('/api/notifications/mark_all_read/');
  }

  // ─── DEVICE TOKEN (FCM) ───
  Future<void> registerDeviceToken(String fcmToken, {String platform = 'android'}) async {
    try {
      await _dio.post('/api/users/device-token/', data: {'token': fcmToken, 'platform': platform});
    } catch (_) {
      // Endpoint may not exist yet — handled in Wave 6.
    }
  }
}

final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService(ref.watch(apiClientProvider));
});
