import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../theme/app_colors.dart';
import '../theme/theme_provider.dart';

/// Form field with Vaadaka styling: uppercase label, bold border, red focus.
class BrandTextField extends ConsumerWidget {
  final String label;
  final TextEditingController controller;
  final String? hint;
  final IconData? icon;
  final bool obscure;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;
  final int maxLines;
  final void Function(String)? onChanged;
  final TextInputAction textInputAction;
  final FocusNode? focusNode;
  final void Function()? onEditingComplete;

  const BrandTextField({
    super.key,
    required this.label,
    required this.controller,
    this.hint,
    this.icon,
    this.obscure = false,
    this.keyboardType,
    this.validator,
    this.maxLines = 1,
    this.onChanged,
    this.textInputAction = TextInputAction.next,
    this.focusNode,
    this.onEditingComplete,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: GoogleFonts.barlow(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: palette.textMuted,
            letterSpacing: 2,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          obscureText: obscure,
          keyboardType: keyboardType,
          maxLines: obscure ? 1 : maxLines,
          textInputAction: textInputAction,
          onChanged: onChanged,
          focusNode: focusNode,
          onEditingComplete: onEditingComplete,
          validator: validator,
          style: GoogleFonts.barlow(fontSize: 15, color: palette.textPrimary, fontWeight: FontWeight.w500),
          cursorColor: VaadakaColors.brandRed,
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: icon != null ? Icon(icon, size: 18, color: palette.textMuted) : null,
          ),
        ),
      ],
    );
  }
}
