import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/widgets/brand_button.dart';
import '../../core/widgets/theme_toggle.dart';
import '../../core/widgets/vaadaka_logo.dart';

/// Landing screen for unauthenticated users. Mirrors the web home hero.
class WelcomeScreen extends ConsumerWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);

    return Scaffold(
      backgroundColor: palette.bgPrimary,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  const VaadakaLogo(height: 40, showTagline: false),
                  const Spacer(),
                  const ThemeToggle(),
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: palette.bgSurface2,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: palette.border),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: BoxDecoration(
                              color: palette.highlight,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'RENT ANYTHING · KERALA',
                            style: GoogleFonts.barlow(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: palette.textMuted,
                              letterSpacing: 3,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),
                    Text(
                      'Rent',
                      style: GoogleFonts.bebasNeue(
                        fontSize: 80,
                        color: palette.textPrimary,
                        height: 0.85,
                        letterSpacing: -1.5,
                      ),
                    ),
                    Text(
                      'Anything',
                      style: GoogleFonts.bebasNeue(
                        fontSize: 80,
                        color: palette.highlight,
                        height: 0.85,
                        letterSpacing: -1.5,
                      ),
                    ),
                    Text(
                      'Near You',
                      style: GoogleFonts.bebasNeue(
                        fontSize: 80,
                        color: palette.textPrimary,
                        height: 0.85,
                        letterSpacing: -1.5,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'TOOLS · EQUIPMENT · GEAR',
                      style: GoogleFonts.barlow(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: palette.textMuted,
                        letterSpacing: 3,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'From trusted owners near you.',
                      style: GoogleFonts.barlow(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: palette.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 40),
                    BrandButton(
                      label: 'Browse Items',
                      icon: LucideIcons.search,
                      expand: true,
                      onPressed: () => context.go('/tools'),
                    ),
                    const SizedBox(height: 12),
                    BrandButton(
                      label: 'Sign In',
                      icon: LucideIcons.logIn,
                      variant: BrandButtonVariant.outline,
                      expand: true,
                      onPressed: () => context.push('/login'),
                    ),
                    const SizedBox(height: 12),
                    BrandButton(
                      label: 'Join Now',
                      icon: LucideIcons.userPlus,
                      variant: BrandButtonVariant.ghost,
                      expand: true,
                      onPressed: () => context.push('/register'),
                    ),
                    const SizedBox(height: 40),
                    _FeatureGrid(palette: palette),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FeatureGrid extends StatelessWidget {
  final VaadakaPalette palette;
  const _FeatureGrid({required this.palette});

  @override
  Widget build(BuildContext context) {
    final features = [
      (icon: LucideIcons.mapPin, title: 'Near You', desc: 'Find items from owners within minutes of you.'),
      (icon: LucideIcons.zap, title: 'Instant Book', desc: 'Reserve in seconds. Pick up when ready.'),
      (icon: LucideIcons.creditCard, title: 'No Upfront', desc: 'Free for renters. 2% for owners.'),
    ];
    return Column(
      children: features.map((f) {
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: palette.bgSurface,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: palette.border),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(f.icon, color: VaadakaColors.brandRed, size: 28),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      f.title.toUpperCase(),
                      style: GoogleFonts.bebasNeue(
                        fontSize: 20,
                        color: palette.textPrimary,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      f.desc,
                      style: GoogleFonts.barlow(fontSize: 13, color: palette.textMuted, height: 1.4),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
