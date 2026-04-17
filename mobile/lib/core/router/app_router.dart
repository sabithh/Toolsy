import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/auth_providers.dart';
import '../../features/auth/login_screen.dart';
import '../../features/auth/register_screen.dart';
import '../../features/auth/splash_screen.dart';
import '../../features/bookings/booking_detail_screen.dart';
import '../../features/bookings/bookings_screen.dart';
import '../../features/chat/chat_detail_screen.dart';
import '../../features/chat/chat_list_screen.dart';
import '../../features/dashboard/dashboard_screen.dart';
import '../../features/dashboard/list_item_screen.dart';
import '../../features/home/home_shell.dart';
import '../../features/home/welcome_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../features/tools/tool_detail_screen.dart';
import '../../features/tools/tools_screen.dart';

CustomTransitionPage<T> _fadeSlidePage<T>(Widget child, {LocalKey? key}) {
  return CustomTransitionPage<T>(
    key: key,
    child: child,
    transitionDuration: const Duration(milliseconds: 320),
    reverseTransitionDuration: const Duration(milliseconds: 240),
    transitionsBuilder: (context, animation, secondary, child) {
      final curved = CurvedAnimation(parent: animation, curve: Curves.easeOutCubic);
      return FadeTransition(
        opacity: curved,
        child: SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0, 0.04),
            end: Offset.zero,
          ).animate(curved),
          child: child,
        ),
      );
    },
  );
}

CustomTransitionPage<T> _fadePage<T>(Widget child, {LocalKey? key}) {
  return CustomTransitionPage<T>(
    key: key,
    child: child,
    transitionDuration: const Duration(milliseconds: 220),
    reverseTransitionDuration: const Duration(milliseconds: 160),
    transitionsBuilder: (context, animation, secondary, child) {
      return FadeTransition(opacity: animation, child: child);
    },
  );
}

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    refreshListenable: _AuthRouterNotifier(ref),
    redirect: (context, state) {
      final auth = ref.read(authProvider);
      if (auth.loading) return null;

      final loc = state.matchedLocation;
      final isAuthed = auth.isAuthenticated;
      final authPages = {'/login', '/register', '/welcome'};

      if (!isAuthed && !authPages.contains(loc)) {
        if (loc == '/tools' || loc.startsWith('/tools/')) return null;
        return '/welcome';
      }
      if (isAuthed && authPages.contains(loc)) {
        return '/tools';
      }
      return null;
    },
    routes: [
      GoRoute(path: '/', pageBuilder: (_, s) => _fadePage(const SplashScreen(), key: s.pageKey)),
      GoRoute(path: '/welcome', pageBuilder: (_, s) => _fadeSlidePage(const WelcomeScreen(), key: s.pageKey)),
      GoRoute(path: '/login', pageBuilder: (_, s) => _fadeSlidePage(const LoginScreen(), key: s.pageKey)),
      GoRoute(path: '/register', pageBuilder: (_, s) => _fadeSlidePage(const RegisterScreen(), key: s.pageKey)),

      ShellRoute(
        builder: (context, state, child) => HomeShell(child: child),
        routes: [
          GoRoute(path: '/tools', pageBuilder: (_, s) => _fadePage(const ToolsScreen(), key: s.pageKey)),
          GoRoute(path: '/bookings', pageBuilder: (_, s) => _fadePage(const BookingsScreen(), key: s.pageKey)),
          GoRoute(path: '/chats', pageBuilder: (_, s) => _fadePage(const ChatListScreen(), key: s.pageKey)),
          GoRoute(path: '/dashboard', pageBuilder: (_, s) => _fadePage(const DashboardScreen(), key: s.pageKey)),
          GoRoute(path: '/profile', pageBuilder: (_, s) => _fadePage(const ProfileScreen(), key: s.pageKey)),
        ],
      ),

      GoRoute(
        path: '/tools/:id',
        pageBuilder: (context, s) => _fadeSlidePage(
          ToolDetailScreen(toolId: s.pathParameters['id']!),
          key: s.pageKey,
        ),
      ),
      GoRoute(
        path: '/bookings/:id',
        pageBuilder: (context, s) => _fadeSlidePage(
          BookingDetailScreen(bookingId: s.pathParameters['id']!),
          key: s.pageKey,
        ),
      ),
      GoRoute(
        path: '/chats/:bookingId',
        pageBuilder: (context, s) => _fadeSlidePage(
          ChatDetailScreen(bookingId: s.pathParameters['bookingId']!),
          key: s.pageKey,
        ),
      ),
      GoRoute(
        path: '/list-item',
        pageBuilder: (_, s) => _fadeSlidePage(const ListItemScreen(), key: s.pageKey),
      ),
    ],
  );
});

class _AuthRouterNotifier extends ChangeNotifier {
  _AuthRouterNotifier(this.ref) {
    ref.listen(authProvider, (_, _) => notifyListeners());
  }
  final Ref ref;
}
