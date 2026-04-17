import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../theme/app_colors.dart';
import '../theme/theme_provider.dart';

enum BrandButtonVariant { primary, outline, ghost }

/// Vaadaka-branded button matching the web app's red CTAs.
class BrandButton extends ConsumerWidget {
  final String label;
  final VoidCallback? onPressed;
  final BrandButtonVariant variant;
  final IconData? icon;
  final IconData? trailingIcon;
  final bool loading;
  final bool expand;
  final EdgeInsetsGeometry? padding;

  const BrandButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = BrandButtonVariant.primary,
    this.icon,
    this.trailingIcon,
    this.loading = false,
    this.expand = false,
    this.padding,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);

    Color bg;
    Color fg;
    Border? border;
    switch (variant) {
      case BrandButtonVariant.primary:
        bg = VaadakaColors.brandRed;
        fg = Colors.white;
        border = null;
        break;
      case BrandButtonVariant.outline:
        bg = Colors.transparent;
        fg = palette.textPrimary;
        border = Border.all(color: palette.border);
        break;
      case BrandButtonVariant.ghost:
        bg = palette.bgSurface2;
        fg = palette.textPrimary;
        border = Border.all(color: palette.border);
        break;
    }

    final disabled = onPressed == null || loading;
    if (disabled) {
      bg = bg.withValues(alpha: 0.6);
      fg = fg.withValues(alpha: 0.7);
    }

    final content = Row(
      mainAxisAlignment: expand ? MainAxisAlignment.center : MainAxisAlignment.center,
      mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min,
      children: [
        if (loading)
          SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(strokeWidth: 2, color: fg),
          )
        else if (icon != null)
          Icon(icon, size: 18, color: fg),
        if ((icon != null || loading) && label.isNotEmpty) const SizedBox(width: 10),
        Text(
          label.toUpperCase(),
          style: GoogleFonts.barlow(
            fontSize: 13,
            fontWeight: FontWeight.w800,
            color: fg,
            letterSpacing: 1.5,
          ),
        ),
        if (trailingIcon != null) ...[
          const SizedBox(width: 10),
          Icon(trailingIcon, size: 18, color: fg),
        ],
      ],
    );

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: disabled ? null : onPressed,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: padding ?? const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(8),
            border: border,
          ),
          child: content,
        ),
      ),
    );
  }
}
