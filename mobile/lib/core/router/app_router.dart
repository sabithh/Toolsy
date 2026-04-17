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

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    refreshListenable: _AuthRouterNotifier(ref),
    redirect: (context, state) {
      final auth = ref.read(authProvider);
      // Still bootstrapping
      if (auth.loading) return null;

      final loc = state.matchedLocation;
      final isAuthed = auth.isAuthenticated;
      final authPages = {'/login', '/register', '/welcome'};

      if (!isAuthed && !authPages.contains(loc)) {
        // Allow browse as guest
        if (loc == '/tools' || loc.startsWith('/tools/')) return null;
        return '/welcome';
      }
      if (isAuthed && authPages.contains(loc)) {
        return '/tools';
      }
      return null;
    },
    routes: [
      GoRoute(path: '/', builder: (_, _) => const SplashScreen()),
      GoRoute(path: '/welcome', builder: (_, _) => const WelcomeScreen()),
      GoRoute(path: '/login', builder: (_, _) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, _) => const RegisterScreen()),

      // Main shell with bottom nav
      ShellRoute(
        builder: (context, state, child) => HomeShell(child: child),
        routes: [
          GoRoute(path: '/tools', builder: (_, _) => const ToolsScreen()),
          GoRoute(path: '/bookings', builder: (_, _) => const BookingsScreen()),
          GoRoute(path: '/chats', builder: (_, _) => const ChatListScreen()),
          GoRoute(path: '/dashboard', builder: (_, _) => const DashboardScreen()),
          GoRoute(path: '/profile', builder: (_, _) => const ProfileScreen()),
        ],
      ),

      // Detail pages (full screen)
      GoRoute(
        path: '/tools/:id',
        builder: (context, state) => ToolDetailScreen(toolId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/bookings/:id',
        builder: (context, state) => BookingDetailScreen(bookingId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/chats/:bookingId',
        builder: (context, state) => ChatDetailScreen(bookingId: state.pathParameters['bookingId']!),
      ),
      GoRoute(path: '/list-item', builder: (_, _) => const ListItemScreen()),
    ],
  );
});

class _AuthRouterNotifier extends ChangeNotifier {
  _AuthRouterNotifier(this.ref) {
    ref.listen(authProvider, (_, _) => notifyListeners());
  }
  final Ref ref;
}
