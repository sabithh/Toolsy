import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_service.dart';
import '../../core/models/tool.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/widgets/brand_button.dart';
import '../../core/widgets/placeholder_screen.dart';
import '../auth/auth_providers.dart';
import 'bookings_screen.dart';

final bookingDetailProvider = FutureProvider.autoDispose.family<Booking, String>((ref, id) async {
  return ref.watch(apiServiceProvider).getBooking(id);
});

class BookingDetailScreen extends ConsumerStatefulWidget {
  final String bookingId;
  const BookingDetailScreen({super.key, required this.bookingId});

  @override
  ConsumerState<BookingDetailScreen> createState() => _BookingDetailScreenState();
}

class _BookingDetailScreenState extends ConsumerState<BookingDetailScreen> {
  Razorpay? _razorpay;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _razorpay = Razorpay()
      ..on(Razorpay.EVENT_PAYMENT_SUCCESS, _onPaymentSuccess)
      ..on(Razorpay.EVENT_PAYMENT_ERROR, _onPaymentError)
      ..on(Razorpay.EVENT_EXTERNAL_WALLET, _onExternalWallet);
  }

  @override
  void dispose() {
    _razorpay?.clear();
    super.dispose();
  }

  Future<void> _startPayment(Booking booking) async {
    setState(() => _busy = true);
    try {
      final api = ref.read(apiServiceProvider);
      final order = await api.createPaymentOrder(booking.id);
      if (order['key'] == null || order['amount'] == null) {
        _showSnack('Invalid payment configuration. Please try again.', isError: true);
        return;
      }
      final user = ref.read(authProvider).user;
      final options = {
        'key': order['key'],
        'amount': order['amount'],
        'currency': order['currency'] ?? 'INR',
        'name': 'Vaadaka',
        'description': booking.toolName ?? 'Rental booking',
        'order_id': order['order_id'],
        'prefill': {
          'contact': user?.phone ?? '',
          'email': user?.email ?? '',
          'name': user?.displayName ?? '',
        },
        'theme': {'color': '#D20000'},
      };
      _razorpay!.open(options);
    } catch (e) {
      _showSnack(VaadakaApiClient.describeError(e), isError: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _onPaymentSuccess(PaymentSuccessResponse r) async {
    try {
      await ref.read(apiServiceProvider).verifyPayment(
            bookingId: widget.bookingId,
            razorpayPaymentId: r.paymentId ?? '',
            razorpaySignature: r.signature ?? '',
          );
      _showSnack('Payment successful!');
      ref.invalidate(bookingDetailProvider(widget.bookingId));
      ref.invalidate(bookingsProvider);
    } catch (e) {
      _showSnack('Verification failed: ${VaadakaApiClient.describeError(e)}', isError: true);
    }
  }

  void _onPaymentError(PaymentFailureResponse r) {
    _showSnack('Payment failed: ${r.message ?? r.code}', isError: true);
  }

  void _onExternalWallet(ExternalWalletResponse r) {
    _showSnack('External wallet: ${r.walletName}');
  }

  void _showSnack(String msg, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: isError ? VaadakaColors.error : VaadakaColors.success,
      ),
    );
  }

  Future<void> _cancel() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Cancel booking?'),
        content: const Text('This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('KEEP')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('CANCEL', style: TextStyle(color: VaadakaColors.error)),
          ),
        ],
      ),
    );
    if (confirm != true) return;
    try {
      await ref.read(apiServiceProvider).cancelBooking(widget.bookingId);
      ref.invalidate(bookingDetailProvider(widget.bookingId));
      ref.invalidate(bookingsProvider);
      _showSnack('Booking cancelled');
    } catch (e) {
      _showSnack(VaadakaApiClient.describeError(e), isError: true);
    }
  }

  Future<void> _confirm() async {
    try {
      await ref.read(apiServiceProvider).confirmBooking(widget.bookingId);
      ref.invalidate(bookingDetailProvider(widget.bookingId));
      _showSnack('Booking confirmed');
    } catch (e) {
      _showSnack(VaadakaApiClient.describeError(e), isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);
    final async = ref.watch(bookingDetailProvider(widget.bookingId));
    final user = ref.watch(authProvider).user;

    return Scaffold(
      backgroundColor: palette.bgPrimary,
      appBar: BrandAppBar(
        title: 'Booking',
        leading: IconButton(
          icon: Icon(LucideIcons.arrowLeft, color: palette.textPrimary),
          onPressed: () => context.canPop() ? context.pop() : context.go('/bookings'),
        ),
      ),
      body: async.when(
        loading: () => const LoadingView(),
        error: (e, _) => EmptyStateView(
          icon: LucideIcons.alertTriangle,
          title: 'Failed to load',
          subtitle: VaadakaApiClient.describeError(e),
        ),
        data: (b) {
          final fmt = DateFormat('EEE, MMM d · HH:mm');
          final isRenter = user != null && b.renter != null && user.id == b.renter!['id']?.toString();
          final isProvider = user?.isProvider == true;
          final canPay = isRenter && b.status == 'confirmed' && b.paymentStatus == 'pending';
          final canConfirm = isProvider && b.status == 'pending';
          final canCancel = b.status == 'pending' || b.status == 'confirmed';

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _StatusCard(booking: b, palette: palette),
                const SizedBox(height: 16),
                Text(
                  b.toolName ?? 'Item',
                  style: GoogleFonts.bebasNeue(
                    fontSize: 32,
                    color: palette.textPrimary,
                    height: 0.95,
                    letterSpacing: -0.5,
                  ),
                ),
                if (b.shopName != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    'BY ${b.shopName!.toUpperCase()}',
                    style: GoogleFonts.barlow(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: palette.textMuted,
                      letterSpacing: 2,
                    ),
                  ),
                ],
                const SizedBox(height: 20),
                _DetailBlock(palette: palette, children: [
                  if (b.startDatetime != null)
                    _DetailLine(
                      icon: LucideIcons.calendarCheck,
                      label: 'Starts',
                      value: fmt.format(b.startDatetime!),
                      palette: palette,
                    ),
                  if (b.endDatetime != null)
                    _DetailLine(
                      icon: LucideIcons.calendarX,
                      label: 'Ends',
                      value: fmt.format(b.endDatetime!),
                      palette: palette,
                    ),
                  _DetailLine(
                    icon: LucideIcons.layers,
                    label: 'Quantity',
                    value: '${b.quantity}',
                    palette: palette,
                  ),
                ]),
                const SizedBox(height: 16),
                _DetailBlock(palette: palette, children: [
                  _DetailLine(
                    icon: LucideIcons.indianRupee,
                    label: 'Rental',
                    value: '₹${(b.rentalPrice ?? 0).toStringAsFixed(0)}',
                    palette: palette,
                  ),
                  if ((b.depositAmount ?? 0) > 0)
                    _DetailLine(
                      icon: LucideIcons.shield,
                      label: 'Deposit',
                      value: '₹${b.depositAmount!.toStringAsFixed(0)}',
                      palette: palette,
                    ),
                  _DetailLine(
                    icon: LucideIcons.receipt,
                    label: 'Total',
                    value: '₹${(b.totalAmount ?? 0).toStringAsFixed(0)}',
                    palette: palette,
                    emphasize: true,
                  ),
                ]),
                if ((b.notes ?? '').isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Text(
                    'NOTES',
                    style: GoogleFonts.barlow(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: palette.textMuted,
                      letterSpacing: 2,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    b.notes!,
                    style: GoogleFonts.barlow(
                      fontSize: 14,
                      color: palette.textPrimary,
                      height: 1.5,
                    ),
                  ),
                ],
                const SizedBox(height: 24),
                if (canPay)
                  BrandButton(
                    label: 'Pay ₹${(b.totalAmount ?? 0).toStringAsFixed(0)}',
                    icon: LucideIcons.creditCard,
                    expand: true,
                    loading: _busy,
                    onPressed: _busy ? null : () => _startPayment(b),
                  ),
                if (canConfirm) ...[
                  const SizedBox(height: 8),
                  BrandButton(
                    label: 'Confirm Booking',
                    icon: LucideIcons.check,
                    expand: true,
                    onPressed: _confirm,
                  ),
                ],
                const SizedBox(height: 8),
                BrandButton(
                  label: 'Open Chat',
                  icon: LucideIcons.messageCircle,
                  variant: BrandButtonVariant.outline,
                  expand: true,
                  onPressed: () => context.push('/chats/${b.id}'),
                ),
                if (canCancel) ...[
                  const SizedBox(height: 8),
                  BrandButton(
                    label: 'Cancel',
                    icon: LucideIcons.x,
                    variant: BrandButtonVariant.ghost,
                    expand: true,
                    onPressed: _cancel,
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class _StatusCard extends StatelessWidget {
  final Booking booking;
  final VaadakaPalette palette;
  const _StatusCard({required this.booking, required this.palette});

  @override
  Widget build(BuildContext context) {
    Color color;
    IconData icon;
    String title;
    String subtitle;
    switch (booking.status) {
      case 'active':
        color = VaadakaColors.success;
        icon = LucideIcons.checkCircle;
        title = 'Active';
        subtitle = 'Your rental is in progress';
        break;
      case 'confirmed':
        color = VaadakaColors.info;
        icon = LucideIcons.badgeCheck;
        title = 'Confirmed';
        subtitle = booking.paymentStatus == 'paid'
            ? 'Ready to pick up'
            : 'Complete payment to activate';
        break;
      case 'cancelled':
        color = VaadakaColors.error;
        icon = LucideIcons.x;
        title = 'Cancelled';
        subtitle = 'This booking was cancelled';
        break;
      case 'completed':
      case 'returned':
        color = palette.textMuted;
        icon = LucideIcons.archive;
        title = 'Completed';
        subtitle = 'Rental ended';
        break;
      default:
        color = VaadakaColors.warning;
        icon = LucideIcons.clock;
        title = 'Pending';
        subtitle = 'Waiting for owner to confirm';
    }
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title.toUpperCase(),
                  style: GoogleFonts.barlow(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: color,
                    letterSpacing: 2,
                  ),
                ),
                Text(
                  subtitle,
                  style: GoogleFonts.barlow(
                    fontSize: 12,
                    color: palette.textMuted,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailBlock extends StatelessWidget {
  final VaadakaPalette palette;
  final List<Widget> children;
  const _DetailBlock({required this.palette, required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: palette.bgSurface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: palette.border),
      ),
      child: Column(children: children),
    );
  }
}

class _DetailLine extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final VaadakaPalette palette;
  final bool emphasize;

  const _DetailLine({
    required this.icon,
    required this.label,
    required this.value,
    required this.palette,
    this.emphasize = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      child: Row(
        children: [
          Icon(icon, size: 16, color: palette.textMuted),
          const SizedBox(width: 12),
          Text(
            label.toUpperCase(),
            style: GoogleFonts.barlow(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              color: palette.textMuted,
              letterSpacing: 1.5,
            ),
          ),
          const Spacer(),
          Text(
            value,
            style: emphasize
                ? GoogleFonts.bebasNeue(
                    fontSize: 22,
                    color: VaadakaColors.brandRed,
                    letterSpacing: 1,
                  )
                : GoogleFonts.barlow(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: palette.textPrimary,
                  ),
          ),
        ],
      ),
    );
  }
}
