import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../theme/app_colors.dart';
import '../theme/theme_provider.dart';

/// Sun/Moon toggle button for theme switching.
class ThemeToggle extends ConsumerWidget {
  const ThemeToggle({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);
    return IconButton(
      onPressed: () => ref.read(themeProvider.notifier).toggle(),
      icon: AnimatedSwitcher(
        duration: const Duration(milliseconds: 250),
        transitionBuilder: (child, anim) => RotationTransition(
          turns: Tween(begin: 0.75, end: 1.0).animate(anim),
          child: FadeTransition(opacity: anim, child: child),
        ),
        child: Icon(
          isLight ? LucideIcons.moon : LucideIcons.sun,
          key: ValueKey(isLight),
          size: 20,
          color: palette.textPrimary,
        ),
      ),
      tooltip: isLight ? 'Switch to red mode' : 'Switch to light mode',
    );
  }
}
