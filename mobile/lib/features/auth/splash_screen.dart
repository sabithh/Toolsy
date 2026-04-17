import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/widgets/vaadaka_logo.dart';
import 'auth_providers.dart';

/// Splash screen shown while auth state bootstraps.
class SplashScreen extends ConsumerWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.listen(authProvider, (prev, next) {
      if (next.loading) return;
      if (next.isAuthenticated) {
        context.go('/tools');
      } else {
        context.go('/welcome');
      }
    });

    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);

    return Scaffold(
      backgroundColor: palette.bgPrimary,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const VaadakaLogo(height: 72, showTagline: true),
            const SizedBox(height: 48),
            SizedBox(
              width: 28,
              height: 28,
              child: CircularProgressIndicator(
                strokeWidth: 2.5,
                color: isLight ? VaadakaColors.brandRed : Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
