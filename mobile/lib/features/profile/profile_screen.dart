import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/widgets/brand_button.dart';
import '../../core/widgets/placeholder_screen.dart';
import '../auth/auth_providers.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);
    final user = ref.watch(authProvider).user;

    if (user == null) {
      return Scaffold(
        backgroundColor: palette.bgPrimary,
        appBar: const BrandAppBar(title: 'Profile'),
        body: Center(
          child: BrandButton(
            label: 'Sign In',
            icon: LucideIcons.logIn,
            onPressed: () => context.push('/login'),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: palette.bgPrimary,
      appBar: const BrandAppBar(title: 'Profile'),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _header(user, palette),
          const SizedBox(height: 24),
          _sectionLabel('ACCOUNT', palette),
          const SizedBox(height: 10),
          _infoTile(LucideIcons.user, 'Username', user.username, palette),
          _infoTile(LucideIcons.mail, 'Email', user.email, palette),
          if ((user.phone ?? '').isNotEmpty)
            _infoTile(LucideIcons.phone, 'Phone', user.phone!, palette),
          _infoTile(
            LucideIcons.briefcase,
            'Role',
            user.isProvider ? 'Provider' : 'Renter',
            palette,
          ),
          const SizedBox(height: 24),
          _sectionLabel('PREFERENCES', palette),
          const SizedBox(height: 10),
          _themeRow(ref, palette),
          const SizedBox(height: 24),
          BrandButton(
            label: 'Sign Out',
            icon: LucideIcons.logOut,
            variant: BrandButtonVariant.outline,
            onPressed: () async {
              await ref.read(authProvider.notifier).logout();
              if (context.mounted) context.go('/welcome');
            },
            expand: true,
          ),
          const SizedBox(height: 32),
          Center(
            child: Text(
              'VAADAKA · v1.0',
              style: GoogleFonts.barlow(
                fontSize: 10,
                fontWeight: FontWeight.w800,
                color: palette.textMuted2,
                letterSpacing: 2,
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _header(dynamic user, VaadakaPalette palette) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: palette.bgSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: palette.border),
      ),
      child: Row(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: VaadakaColors.brandRed,
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Text(
              (user.displayName as String).isNotEmpty
                  ? (user.displayName as String)[0].toUpperCase()
                  : '?',
              style: GoogleFonts.bebasNeue(
                fontSize: 32,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user.displayName,
                  style: GoogleFonts.bebasNeue(
                    fontSize: 28,
                    color: palette.textPrimary,
                    letterSpacing: 0.5,
                  ),
                ),
                Text(
                  user.email,
                  style: GoogleFonts.barlow(
                    fontSize: 12,
                    color: palette.textMuted,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                if (user.isVerified == true) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(LucideIcons.badgeCheck, size: 14, color: VaadakaColors.success),
                      const SizedBox(width: 4),
                      Text(
                        'VERIFIED',
                        style: GoogleFonts.barlow(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          color: VaadakaColors.success,
                          letterSpacing: 1.5,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionLabel(String label, VaadakaPalette palette) {
    return Text(
      label,
      style: GoogleFonts.barlow(
        fontSize: 11,
        fontWeight: FontWeight.w800,
        color: palette.textMuted,
        letterSpacing: 2,
      ),
    );
  }

  Widget _infoTile(IconData icon, String label, String value, VaadakaPalette palette) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: palette.bgSurface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: palette.border),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: palette.textMuted),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label.toUpperCase(),
                  style: GoogleFonts.barlow(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: palette.textMuted,
                    letterSpacing: 1.5,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: GoogleFonts.barlow(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: palette.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _themeRow(WidgetRef ref, VaadakaPalette palette) {
    final isLight = ref.watch(isLightProvider);
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: palette.bgSurface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: palette.border),
      ),
      child: Row(
        children: [
          Icon(
            isLight ? LucideIcons.sun : LucideIcons.moon,
            size: 18,
            color: palette.textMuted,
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              isLight ? 'Light Mode' : 'Brand (Red) Mode',
              style: GoogleFonts.barlow(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: palette.textPrimary,
              ),
            ),
          ),
          Switch(
            value: !isLight,
            activeThumbColor: Colors.white,
            activeTrackColor: VaadakaColors.brandRed,
            inactiveTrackColor: palette.bgSurface2,
            onChanged: (_) => ref.read(themeProvider.notifier).toggle(),
          ),
        ],
      ),
    );
  }
}
