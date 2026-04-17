import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/theme_provider.dart';
import '../auth/auth_providers.dart';

/// Bottom-nav shell wrapping Tools / Bookings / Chats / Dashboard / Profile.
class HomeShell extends ConsumerWidget {
  final Widget child;
  const HomeShell({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);
    final user = ref.watch(authProvider).user;
    final isProvider = user?.isProvider == true;

    // Build items based on role
    final items = <_NavItem>[
      _NavItem(path: '/tools', icon: LucideIcons.search, label: 'Browse'),
      _NavItem(path: '/bookings', icon: LucideIcons.calendar, label: 'Rentals'),
      _NavItem(path: '/chats', icon: LucideIcons.messageCircle, label: 'Chats'),
      if (isProvider) _NavItem(path: '/dashboard', icon: LucideIcons.layoutDashboard, label: 'Dashboard'),
      _NavItem(path: '/profile', icon: LucideIcons.user, label: 'Profile'),
    ];

    final currentPath = GoRouterState.of(context).matchedLocation;
    int currentIndex = items.indexWhere((i) => currentPath.startsWith(i.path));
    if (currentIndex < 0) currentIndex = 0;

    return Scaffold(
      backgroundColor: palette.bgPrimary,
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: palette.bgSurface,
          border: Border(top: BorderSide(color: palette.border)),
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: items.map((item) {
                final isActive = items.indexOf(item) == currentIndex;
                return Expanded(
                  child: InkWell(
                    onTap: () => context.go(item.path),
                    borderRadius: BorderRadius.circular(8),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            item.icon,
                            color: isActive ? VaadakaColors.brandRed : palette.textMuted,
                            size: 22,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            item.label.toUpperCase(),
                            style: GoogleFonts.barlow(
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              color: isActive ? VaadakaColors.brandRed : palette.textMuted,
                              letterSpacing: 1.2,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final String path;
  final IconData icon;
  final String label;
  const _NavItem({required this.path, required this.icon, required this.label});
}
