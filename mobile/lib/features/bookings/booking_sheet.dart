import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_service.dart';
import '../../core/models/tool.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/widgets/brand_button.dart';

Future<void> showBookingSheet(BuildContext context, WidgetRef ref, Tool tool) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => _BookingSheet(tool: tool),
  );
}

class _BookingSheet extends ConsumerStatefulWidget {
  final Tool tool;
  const _BookingSheet({required this.tool});

  @override
  ConsumerState<_BookingSheet> createState() => _BookingSheetState();
}

class _BookingSheetState extends ConsumerState<_BookingSheet> {
  DateTime? _start;
  DateTime? _end;
  int _quantity = 1;
  String? _notes;
  bool _submitting = false;
  String? _error;
  final _notesController = TextEditingController();

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  double get _days {
    if (_start == null || _end == null) return 0;
    final diff = _end!.difference(_start!).inMinutes / 60.0 / 24.0;
    return diff > 0 ? diff : 0;
  }

  double get _rental => _days * widget.tool.displayPrice * _quantity;
  double get _deposit => (widget.tool.depositAmount ?? 0) * _quantity;
  double get _total => _rental + _deposit;

  Future<void> _pickStart() async {
    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      initialDate: _start ?? now.add(const Duration(hours: 1)),
      firstDate: now,
      lastDate: now.add(const Duration(days: 90)),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_start ?? now.add(const Duration(hours: 1))),
    );
    if (time == null) return;
    setState(() {
      _start = DateTime(date.year, date.month, date.day, time.hour, time.minute);
      if (_end != null && _end!.isBefore(_start!)) _end = null;
    });
  }

  Future<void> _pickEnd() async {
    final base = _start ?? DateTime.now();
    final date = await showDatePicker(
      context: context,
      initialDate: _end ?? base.add(const Duration(hours: 2)),
      firstDate: base,
      lastDate: base.add(const Duration(days: 90)),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_end ?? base.add(const Duration(hours: 2))),
    );
    if (time == null) return;
    setState(() {
      _end = DateTime(date.year, date.month, date.day, time.hour, time.minute);
    });
  }

  Future<void> _submit() async {
    if (_start == null || _end == null) {
      setState(() => _error = 'Pick start and end times');
      return;
    }
    if (!_end!.isAfter(_start!)) {
      setState(() => _error = 'End must be after start');
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final api = ref.read(apiServiceProvider);
      final booking = await api.createBooking({
        'tool_id': widget.tool.id,
        'quantity': _quantity,
        'start_datetime': _start!.toUtc().toIso8601String(),
        'end_datetime': _end!.toUtc().toIso8601String(),
        'rental_price': _rental.toStringAsFixed(2),
        'deposit_amount': _deposit.toStringAsFixed(2),
        'payment_method': 'razorpay',
        if ((_notes ?? '').isNotEmpty) 'notes': _notes,
      });
      if (!mounted) return;
      Navigator.of(context).pop();
      context.go('/bookings/${booking.id}');
    } catch (e) {
      setState(() {
        _submitting = false;
        _error = VaadakaApiClient.describeError(e);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: Container(
        decoration: BoxDecoration(
          color: palette.bgSurface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
          border: Border(top: BorderSide(color: palette.border)),
        ),
        child: SafeArea(
          top: false,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: palette.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Book Item',
                  style: GoogleFonts.bebasNeue(
                    fontSize: 32,
                    color: palette.textPrimary,
                    letterSpacing: 1,
                  ),
                ),
                Text(
                  widget.tool.name,
                  style: GoogleFonts.barlow(
                    fontSize: 13,
                    color: palette.textMuted,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 24),
                _DateTimeRow(
                  label: 'Start',
                  value: _start,
                  onTap: _pickStart,
                  palette: palette,
                ),
                const SizedBox(height: 12),
                _DateTimeRow(
                  label: 'End',
                  value: _end,
                  onTap: _pickEnd,
                  palette: palette,
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Text(
                      'QUANTITY',
                      style: GoogleFonts.barlow(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: palette.textMuted,
                        letterSpacing: 2,
                      ),
                    ),
                    const Spacer(),
                    _QtyButton(
                      icon: LucideIcons.minus,
                      onTap: _quantity > 1 ? () => setState(() => _quantity--) : null,
                      palette: palette,
                    ),
                    Container(
                      width: 48,
                      alignment: Alignment.center,
                      child: Text(
                        '$_quantity',
                        style: GoogleFonts.bebasNeue(
                          fontSize: 24,
                          color: palette.textPrimary,
                        ),
                      ),
                    ),
                    _QtyButton(
                      icon: LucideIcons.plus,
                      onTap: _quantity < widget.tool.quantityAvailable
                          ? () => setState(() => _quantity++)
                          : null,
                      palette: palette,
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _notesController,
                  onChanged: (v) => _notes = v,
                  maxLines: 2,
                  style: GoogleFonts.barlow(fontSize: 14, color: palette.textPrimary),
                  cursorColor: VaadakaColors.brandRed,
                  decoration: InputDecoration(
                    hintText: 'Notes (optional)',
                    hintStyle: GoogleFonts.barlow(fontSize: 13, color: palette.textMuted),
                    filled: true,
                    fillColor: palette.bgSurface2,
                    contentPadding: const EdgeInsets.all(14),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: palette.border),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(color: palette.border),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: palette.bgSurface2,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: palette.border),
                  ),
                  child: Column(
                    children: [
                      _PriceLine(
                        label: 'Days',
                        value: _days.toStringAsFixed(1),
                        palette: palette,
                      ),
                      _PriceLine(
                        label: 'Rental',
                        value: '₹${_rental.toStringAsFixed(0)}',
                        palette: palette,
                      ),
                      if (_deposit > 0)
                        _PriceLine(
                          label: 'Deposit (refundable)',
                          value: '₹${_deposit.toStringAsFixed(0)}',
                          palette: palette,
                        ),
                      Divider(color: palette.border, height: 24),
                      _PriceLine(
                        label: 'TOTAL',
                        value: '₹${_total.toStringAsFixed(0)}',
                        palette: palette,
                        emphasize: true,
                      ),
                    ],
                  ),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: VaadakaColors.error.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: VaadakaColors.error.withValues(alpha: 0.4)),
                    ),
                    child: Text(
                      _error!,
                      style: GoogleFonts.barlow(
                        fontSize: 13,
                        color: VaadakaColors.error,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 16),
                BrandButton(
                  label: 'Request Booking',
                  icon: LucideIcons.send,
                  expand: true,
                  loading: _submitting,
                  onPressed: _submitting ? null : _submit,
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _DateTimeRow extends StatelessWidget {
  final String label;
  final DateTime? value;
  final VoidCallback onTap;
  final VaadakaPalette palette;

  const _DateTimeRow({
    required this.label,
    required this.value,
    required this.onTap,
    required this.palette,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: palette.bgSurface2,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: palette.border),
          ),
          child: Row(
            children: [
              Icon(LucideIcons.calendar, size: 18, color: palette.textMuted),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label.toUpperCase(),
                    style: GoogleFonts.barlow(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: palette.textMuted,
                      letterSpacing: 2,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    value == null
                        ? 'Select date & time'
                        : DateFormat('MMM d · HH:mm').format(value!),
                    style: GoogleFonts.barlow(
                      fontSize: 14,
                      color: palette.textPrimary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              Icon(LucideIcons.chevronRight, size: 18, color: palette.textMuted),
            ],
          ),
        ),
      ),
    );
  }
}

class _QtyButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;
  final VaadakaPalette palette;

  const _QtyButton({required this.icon, required this.onTap, required this.palette});

  @override
  Widget build(BuildContext context) {
    final disabled = onTap == null;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(6),
        child: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: disabled ? palette.bgSurface2 : VaadakaColors.brandRed,
            borderRadius: BorderRadius.circular(6),
          ),
          child: Icon(
            icon,
            size: 16,
            color: disabled ? palette.textMuted : Colors.white,
          ),
        ),
      ),
    );
  }
}

class _PriceLine extends StatelessWidget {
  final String label;
  final String value;
  final VaadakaPalette palette;
  final bool emphasize;

  const _PriceLine({
    required this.label,
    required this.value,
    required this.palette,
    this.emphasize = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label.toUpperCase(),
            style: GoogleFonts.barlow(
              fontSize: emphasize ? 12 : 11,
              fontWeight: emphasize ? FontWeight.w800 : FontWeight.w700,
              color: emphasize ? palette.textPrimary : palette.textMuted,
              letterSpacing: 1.5,
            ),
          ),
          Text(
            value,
            style: emphasize
                ? GoogleFonts.bebasNeue(fontSize: 24, color: VaadakaColors.brandRed)
                : GoogleFonts.barlow(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: palette.textPrimary,
                  ),
          ),
        ],
      ),
    );
  }
}
