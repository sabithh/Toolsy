import 'package:flutter/material.dart';

/// Vaadaka brand color system, matching the web app's two-mode theme.
///
/// Mode 1 (red): page bg is red, surfaces are dark, accent = black
/// Mode 2 (light): page bg is white, surfaces are white, accent = red
class VaadakaColors {
  VaadakaColors._();

  // Brand constants (same in both modes)
  static const Color brandRed = Color(0xFFD20000);
  static const Color brandRedHover = Color(0xFFB10000);
  static const Color brandBlack = Color(0xFF0A0A0A);
  static const Color brandWhite = Color(0xFFFFFFFF);

  // ─── Red brand theme ───
  static const Color redBgPrimary = Color(0xFFD20000);
  static const Color redBgSurface = Color(0xFF0A0A0A);
  static const Color redBgSurface2 = Color(0xFF111111);
  static const Color redBorder = Color(0x4D000000); // 30% black
  static const Color redTextPrimary = Color(0xFFFFFFFF);
  static const Color redTextMuted = Color(0x8CFFFFFF); // 55% white
  static const Color redTextMuted2 = Color(0x59FFFFFF); // 35% white
  static const Color redHighlight = Color(0xFF000000);
  static const Color redHighlightHover = Color(0xFF2A2A2A);
  static const Color redNavBg = Color(0xEB000000); // 92% black

  // ─── Light theme ───
  static const Color lightBgPrimary = Color(0xFFF8F8F8);
  static const Color lightBgSurface = Color(0xFFFFFFFF);
  static const Color lightBgSurface2 = Color(0xFFF0F0F0);
  static const Color lightBorder = Color(0xFFE2E2E2);
  static const Color lightTextPrimary = Color(0xFF0A0A0A);
  static const Color lightTextMuted = Color(0xFF888888);
  static const Color lightTextMuted2 = Color(0xFFAAAAAA);
  static const Color lightHighlight = brandRed;
  static const Color lightHighlightHover = brandRedHover;
  static const Color lightNavBg = Color(0xF5F8F8F8); // 96% bg

  // Status colors
  static const Color success = Color(0xFF16A34A);
  static const Color warning = Color(0xFFEAB308);
  static const Color error = Color(0xFFDC2626);
  static const Color info = Color(0xFF2563EB);
}

/// Resolves brand colors based on current theme mode.
class VaadakaPalette {
  final bool isLight;
  const VaadakaPalette(this.isLight);

  Color get bgPrimary => isLight ? VaadakaColors.lightBgPrimary : VaadakaColors.redBgPrimary;
  Color get bgSurface => isLight ? VaadakaColors.lightBgSurface : VaadakaColors.redBgSurface;
  Color get bgSurface2 => isLight ? VaadakaColors.lightBgSurface2 : VaadakaColors.redBgSurface2;
  Color get border => isLight ? VaadakaColors.lightBorder : VaadakaColors.redBorder;
  Color get textPrimary => isLight ? VaadakaColors.lightTextPrimary : VaadakaColors.redTextPrimary;
  Color get textMuted => isLight ? VaadakaColors.lightTextMuted : VaadakaColors.redTextMuted;
  Color get textMuted2 => isLight ? VaadakaColors.lightTextMuted2 : VaadakaColors.redTextMuted2;
  Color get highlight => isLight ? VaadakaColors.lightHighlight : VaadakaColors.redHighlight;
  Color get highlightHover => isLight ? VaadakaColors.lightHighlightHover : VaadakaColors.redHighlightHover;
  Color get accent => VaadakaColors.brandRed;
  Color get accentHover => VaadakaColors.brandRedHover;
  Color get navBg => isLight ? VaadakaColors.lightNavBg : VaadakaColors.redNavBg;
}
