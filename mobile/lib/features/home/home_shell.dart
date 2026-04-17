import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/theme_provider.dart';
import '../auth/auth_providers.dart';

class HomeShell extends ConsumerWidget {
  final Widget child;
  const HomeShell({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);
    final user = ref.watch(authProvider).user;
    final isProvider = user?.isProvider == true;

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
      body: PageTransitionSwitcher(child: child),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: palette.bgSurface,
          border: Border(top: BorderSide(color: palette.border)),
        ),
        child: SafeArea(
          top: false,
          child: LayoutBuilder(
            builder: (context, constraints) {
              final tabWidth = constraints.maxWidth / items.length;
              return SizedBox(
                height: 64,
                child: Stack(
                  children: [
                    AnimatedPositioned(
                      duration: const Duration(milliseconds: 320),
                      curve: Curves.easeOutCubic,
                      left: tabWidth * currentIndex + (tabWidth - 28) / 2,
                      top: 6,
                      child: Container(
                        width: 28,
                        height: 3,
                        decoration: BoxDecoration(
                          color: VaadakaColors.brandRed,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    Row(
                      children: items.map((item) {
                        final isActive = items.indexOf(item) == currentIndex;
                        return Expanded(
                          child: InkWell(
                            onTap: () => context.go(item.path),
                            borderRadius: BorderRadius.circular(8),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  AnimatedScale(
                                    scale: isActive ? 1.1 : 1.0,
                                    duration: const Duration(milliseconds: 240),
                                    curve: Curves.easeOutCubic,
                                    child: AnimatedSwitcher(
                                      duration: const Duration(milliseconds: 200),
                                      child: Icon(
                                        item.icon,
                                        key: ValueKey(isActive),
                                        color: isActive ? VaadakaColors.brandRed : palette.textMuted,
                                        size: 22,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  AnimatedDefaultTextStyle(
                                    duration: const Duration(milliseconds: 240),
                                    curve: Curves.easeOutCubic,
                                    style: GoogleFonts.barlow(
                                      fontSize: 9,
                                      fontWeight: FontWeight.w800,
                                      color: isActive ? VaadakaColors.brandRed : palette.textMuted,
                                      letterSpacing: 1.2,
                                    ),
                                    child: Text(item.label.toUpperCase()),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

/// Cross-fades between tab bodies so shell navigation feels smooth
/// instead of a hard swap when the inner child widget changes.
class PageTransitionSwitcher extends StatelessWidget {
  final Widget child;
  const PageTransitionSwitcher({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 260),
      switchInCurve: Curves.easeOutCubic,
      switchOutCurve: Curves.easeInCubic,
      transitionBuilder: (child, animation) {
        return FadeTransition(
          opacity: animation,
          child: SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(0, 0.02),
              end: Offset.zero,
            ).animate(animation),
            child: child,
          ),
        );
      },
      child: KeyedSubtree(key: ValueKey(child.runtimeType), child: child),
    );
  }
}

class _NavItem {
  final String path;
  final IconData icon;
  final String label;
  const _NavItem({required this.path, required this.icon, required this.label});
}
