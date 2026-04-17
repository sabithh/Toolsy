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
import '../../core/widgets/placeholder_screen.dart';

final bookingsProvider = FutureProvider.autoDispose<List<Booking>>((ref) async {
  return ref.watch(apiServiceProvider).listBookings();
});

class BookingsScreen extends ConsumerWidget {
  const BookingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);
    final async = ref.watch(bookingsProvider);

    return Scaffold(
      backgroundColor: palette.bgPrimary,
      appBar: BrandAppBar(
        title: 'My Rentals',
        actions: [
          IconButton(
            icon: Icon(LucideIcons.refreshCw, color: palette.textPrimary, size: 18),
            onPressed: () => ref.invalidate(bookingsProvider),
          ),
        ],
      ),
      body: async.when(
        loading: () => const LoadingView(),
        error: (e, _) => EmptyStateView(
          icon: LucideIcons.alertTriangle,
          title: 'Failed to load',
          subtitle: e.toString(),
        ),
        data: (bookings) {
          if (bookings.isEmpty) {
            return const EmptyStateView(
              icon: LucideIcons.calendar,
              title: 'No bookings yet',
              subtitle: 'Browse items and book your first rental.',
            );
          }
          return RefreshIndicator(
            color: VaadakaColors.brandRed,
            backgroundColor: palette.bgSurface,
            onRefresh: () async => ref.invalidate(bookingsProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: bookings.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (_, i) => _BookingCard(booking: bookings[i], palette: palette),
            ),
          );
        },
      ),
    );
  }
}

class _BookingCard extends StatelessWidget {
  final Booking booking;
  final VaadakaPalette palette;
  const _BookingCard({required this.booking, required this.palette});

  Color _statusColor() {
    switch (booking.status) {
      case 'active':
        return VaadakaColors.success;
      case 'confirmed':
        return VaadakaColors.info;
      case 'cancelled':
      case 'rejected':
        return VaadakaColors.error;
      case 'completed':
      case 'returned':
        return palette.textMuted;
      default:
        return VaadakaColors.warning;
    }
  }

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('MMM d · HH:mm');
    return Material(
      color: palette.bgSurface,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: () => context.push('/bookings/${booking.id}'),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: palette.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      booking.toolName ?? 'Booking',
                      style: GoogleFonts.barlow(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: palette.textPrimary,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _statusColor().withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      booking.status.toUpperCase(),
                      style: GoogleFonts.barlow(
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        color: _statusColor(),
                        letterSpacing: 1.5,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              if (booking.startDatetime != null && booking.endDatetime != null)
                Row(
                  children: [
                    Icon(LucideIcons.calendar, size: 14, color: palette.textMuted),
                    const SizedBox(width: 6),
                    Text(
                      '${fmt.format(booking.startDatetime!)}  →  ${fmt.format(booking.endDatetime!)}',
                      style: GoogleFonts.barlow(
                        fontSize: 12,
                        color: palette.textMuted,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '₹${(booking.totalAmount ?? 0).toStringAsFixed(0)}',
                    style: GoogleFonts.bebasNeue(
                      fontSize: 22,
                      color: VaadakaColors.brandRed,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(width: 10),
                  if (booking.paymentStatus == 'paid')
                    _pill('PAID', VaadakaColors.success)
                  else if (booking.paymentStatus == 'pending')
                    _pill('PAYMENT PENDING', VaadakaColors.warning),
                  const Spacer(),
                  Icon(LucideIcons.chevronRight, size: 16, color: palette.textMuted),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _pill(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(3),
      ),
      child: Text(
        label,
        style: GoogleFonts.barlow(
          fontSize: 9,
          fontWeight: FontWeight.w800,
          color: color,
          letterSpacing: 1.3,
        ),
      ),
    );
  }
}
