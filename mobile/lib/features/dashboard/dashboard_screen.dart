import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../core/api/api_service.dart';
import '../../core/models/tool.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/widgets/brand_button.dart';
import '../../core/widgets/placeholder_screen.dart';
import '../auth/auth_providers.dart';

final providerBookingsProvider = FutureProvider.autoDispose<List<Booking>>((ref) async {
  return ref.watch(apiServiceProvider).listBookings();
});

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);
    final user = ref.watch(authProvider).user;
    final bookingsAsync = ref.watch(providerBookingsProvider);

    if (user == null || !user.isProvider) {
      return Scaffold(
        backgroundColor: palette.bgPrimary,
        appBar: const BrandAppBar(title: 'Dashboard'),
        body: const EmptyStateView(
          icon: LucideIcons.userX,
          title: 'Provider only',
          subtitle: 'Switch to a provider account to list items.',
        ),
      );
    }

    return Scaffold(
      backgroundColor: palette.bgPrimary,
      appBar: BrandAppBar(
        title: 'Dashboard',
        actions: [
          IconButton(
            icon: Icon(LucideIcons.refreshCw, color: palette.textPrimary, size: 18),
            onPressed: () {
              ref.invalidate(providerBookingsProvider);
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        color: VaadakaColors.brandRed,
        backgroundColor: palette.bgSurface,
        onRefresh: () async {
          ref.invalidate(providerBookingsProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _sectionLabel('QUICK ACTIONS', palette),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: BrandButton(
                    label: 'List Item',
                    icon: LucideIcons.plus,
                    onPressed: () => context.push('/list-item'),
                    expand: true,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: BrandButton(
                    label: 'My Rentals',
                    icon: LucideIcons.calendar,
                    variant: BrandButtonVariant.outline,
                    onPressed: () => context.go('/bookings'),
                    expand: true,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            _sectionLabel('INCOMING BOOKINGS', palette),
            const SizedBox(height: 10),
            bookingsAsync.when(
              loading: () => const Padding(padding: EdgeInsets.all(20), child: LoadingView()),
              error: (e, _) => _errorCard(e.toString(), palette),
              data: (bookings) {
                if (bookings.isEmpty) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    child: Text(
                      'No bookings yet.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.barlow(fontSize: 13, color: palette.textMuted),
                    ),
                  );
                }
                return Column(
                  children: bookings.take(8).map((b) => _bookingRow(context, b, palette)).toList(),
                );
              },
            ),
            const SizedBox(height: 32),
          ],
        ),
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

  Widget _bookingRow(BuildContext context, Booking b, VaadakaPalette palette) {
    final fmt = DateFormat('MMM d · HH:mm');
    Color statusColor;
    switch (b.status) {
      case 'active':
        statusColor = VaadakaColors.success;
        break;
      case 'confirmed':
        statusColor = VaadakaColors.info;
        break;
      case 'cancelled':
      case 'rejected':
        statusColor = VaadakaColors.error;
        break;
      default:
        statusColor = VaadakaColors.warning;
    }
    return Material(
      color: palette.bgSurface,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: () => context.push('/bookings/${b.id}'),
        child: Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: palette.border),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      b.toolName ?? 'Booking',
                      style: GoogleFonts.barlow(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: palette.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    if (b.startDatetime != null)
                      Text(
                        fmt.format(b.startDatetime!),
                        style: GoogleFonts.barlow(fontSize: 11, color: palette.textMuted),
                      ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(3),
                ),
                child: Text(
                  b.status.toUpperCase(),
                  style: GoogleFonts.barlow(
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    color: statusColor,
                    letterSpacing: 1.2,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Icon(LucideIcons.chevronRight, size: 14, color: palette.textMuted),
            ],
          ),
        ),
      ),
    );
  }

  Widget _errorCard(String msg, VaadakaPalette palette) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: VaadakaColors.error.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: VaadakaColors.error.withValues(alpha: 0.3)),
      ),
      child: Text(
        msg,
        style: GoogleFonts.barlow(fontSize: 12, color: VaadakaColors.error),
      ),
    );
  }
}
