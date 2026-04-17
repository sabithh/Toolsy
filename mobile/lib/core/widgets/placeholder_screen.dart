import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';
import '../theme/theme_provider.dart';

/// Generic empty/loading state used across list screens.
class EmptyStateView extends ConsumerWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Widget? action;

  const EmptyStateView({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
    this.action,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 48, color: palette.textMuted2),
            const SizedBox(height: 20),
            Text(
              title.toUpperCase(),
              textAlign: TextAlign.center,
              style: GoogleFonts.bebasNeue(
                fontSize: 22,
                color: palette.textPrimary,
                letterSpacing: 1.5,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: GoogleFonts.barlow(fontSize: 13, color: palette.textMuted),
            ),
            if (action != null) ...[
              const SizedBox(height: 20),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}

class LoadingView extends StatelessWidget {
  const LoadingView({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: SizedBox(
        width: 28,
        height: 28,
        child: CircularProgressIndicator(strokeWidth: 2.5, color: VaadakaColors.brandRed),
      ),
    );
  }
}

class BrandAppBar extends ConsumerWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;
  final Widget? leading;
  final bool centerTitle;

  const BrandAppBar({
    super.key,
    required this.title,
    this.actions,
    this.leading,
    this.centerTitle = false,
  });

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);
    return AppBar(
      backgroundColor: palette.bgPrimary,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 0,
      leading: leading,
      centerTitle: centerTitle,
      title: Text(
        title.toUpperCase(),
        style: GoogleFonts.bebasNeue(
          fontSize: 24,
          color: palette.textPrimary,
          letterSpacing: 1.5,
        ),
      ),
      actions: actions,
    );
  }
}
