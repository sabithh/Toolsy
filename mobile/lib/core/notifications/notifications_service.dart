import 'dart:async';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../api/api_service.dart';

/// Initializes Firebase + local notifications, wires up foreground/background
/// handlers, and registers the FCM token with the backend once a user logs in.
///
/// Gracefully degrades to local-only notifications if Firebase isn't
/// configured (e.g. missing google-services.json during local development).
class NotificationsService {
  NotificationsService(this._ref);

  final Ref _ref;
  final _localNotifications = FlutterLocalNotificationsPlugin();
  bool _firebaseReady = false;
  bool _localReady = false;
  String? _registeredToken;

  /// Called once from main() before runApp.
  Future<void> init() async {
    await _initLocal();
    await _initFirebase();
  }

  Future<void> _initLocal() async {
    try {
      const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
      const iosInit = DarwinInitializationSettings(
        requestAlertPermission: true,
        requestBadgePermission: true,
        requestSoundPermission: true,
      );
      const settings = InitializationSettings(android: androidInit, iOS: iosInit);
      await _localNotifications.initialize(settings);

      // Create default Android channel.
      const channel = AndroidNotificationChannel(
        'vaadaka_default',
        'Vaadaka',
        description: 'Bookings, messages, and reminders',
        importance: Importance.high,
      );
      final androidPlugin = _localNotifications
          .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
      await androidPlugin?.createNotificationChannel(channel);
      await androidPlugin?.requestNotificationsPermission();
      _localReady = true;
    } catch (e) {
      debugPrint('[notifications] local init failed: $e');
    }
  }

  Future<void> _initFirebase() async {
    try {
      await Firebase.initializeApp();
      await FirebaseMessaging.instance.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );
      FirebaseMessaging.onMessage.listen(_onForegroundMessage);
      _firebaseReady = true;
    } catch (e) {
      debugPrint('[notifications] firebase not configured — push disabled: $e');
    }
  }

  Future<void> _onForegroundMessage(RemoteMessage message) async {
    if (!_localReady) return;
    final n = message.notification;
    if (n == null) return;
    await _localNotifications.show(
      n.hashCode,
      n.title,
      n.body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'vaadaka_default',
          'Vaadaka',
          channelDescription: 'Bookings, messages, and reminders',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(),
      ),
    );
  }

  /// Register the current FCM token with the backend. No-op if Firebase or
  /// auth aren't ready yet.
  Future<void> registerTokenIfNeeded() async {
    if (!_firebaseReady) return;
    try {
      final token = await FirebaseMessaging.instance.getToken();
      if (token == null || token == _registeredToken) return;
      await _ref.read(apiServiceProvider).registerDeviceToken(token);
      _registeredToken = token;
    } catch (e) {
      debugPrint('[notifications] token register failed: $e');
    }
  }

  /// Show a local (non-push) notification — e.g. for scheduled reminders.
  Future<void> showLocal({required String title, required String body}) async {
    if (!_localReady) return;
    await _localNotifications.show(
      DateTime.now().millisecondsSinceEpoch.remainder(100000),
      title,
      body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'vaadaka_default',
          'Vaadaka',
          channelDescription: 'Bookings, messages, and reminders',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(),
      ),
    );
  }
}

final notificationsServiceProvider = Provider<NotificationsService>((ref) {
  return NotificationsService(ref);
});
