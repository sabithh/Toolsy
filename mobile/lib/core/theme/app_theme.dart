import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// Builds Material ThemeData for Vaadaka, matching the web app's two modes.
class VaadakaTheme {
  VaadakaTheme._();

  /// Bebas Neue — for headlines and uppercase buttons.
  static TextStyle bebas({
    double fontSize = 24,
    FontWeight fontWeight = FontWeight.w400,
    Color? color,
    double letterSpacing = 1.0,
    double? height,
  }) =>
      GoogleFonts.bebasNeue(
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: color,
        letterSpacing: letterSpacing,
        height: height,
      );

  /// Barlow — for body text, labels, UI copy.
  static TextStyle barlow({
    double fontSize = 14,
    FontWeight fontWeight = FontWeight.w400,
    Color? color,
    double? letterSpacing,
    double? height,
  }) =>
      GoogleFonts.barlow(
        fontSize: fontSize,
        fontWeight: fontWeight,
        color: color,
        letterSpacing: letterSpacing,
        height: height,
      );

  /// Barlow uppercase — for pills, badges, small labels.
  static TextStyle label({
    double fontSize = 11,
    Color? color,
  }) =>
      GoogleFonts.barlow(
        fontSize: fontSize,
        fontWeight: FontWeight.w700,
        color: color,
        letterSpacing: fontSize < 12 ? 2.5 : 1.8,
      );

  static ThemeData light() => _buildTheme(isLight: true);
  static ThemeData red() => _buildTheme(isLight: false);

  static ThemeData _buildTheme({required bool isLight}) {
    final palette = VaadakaPalette(isLight);
    final brightness = isLight ? Brightness.light : Brightness.dark;

    final colorScheme = ColorScheme(
      brightness: brightness,
      primary: VaadakaColors.brandRed,
      onPrimary: Colors.white,
      secondary: palette.highlight,
      onSecondary: palette.bgPrimary,
      error: VaadakaColors.error,
      onError: Colors.white,
      surface: palette.bgSurface,
      onSurface: palette.textPrimary,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: palette.bgPrimary,
      canvasColor: palette.bgPrimary,
      dividerColor: palette.border,
      splashFactory: NoSplash.splashFactory,
      fontFamily: GoogleFonts.barlow().fontFamily,
      textTheme: TextTheme(
        displayLarge: bebas(fontSize: 72, fontWeight: FontWeight.w900, color: palette.textPrimary, height: 0.9),
        displayMedium: bebas(fontSize: 56, fontWeight: FontWeight.w900, color: palette.textPrimary, height: 0.9),
        displaySmall: bebas(fontSize: 40, fontWeight: FontWeight.w900, color: palette.textPrimary, height: 0.95),
        headlineLarge: bebas(fontSize: 32, fontWeight: FontWeight.w900, color: palette.textPrimary),
        headlineMedium: bebas(fontSize: 24, fontWeight: FontWeight.w700, color: palette.textPrimary),
        headlineSmall: bebas(fontSize: 20, fontWeight: FontWeight.w700, color: palette.textPrimary),
        titleLarge: barlow(fontSize: 18, fontWeight: FontWeight.w700, color: palette.textPrimary),
        titleMedium: barlow(fontSize: 16, fontWeight: FontWeight.w700, color: palette.textPrimary),
        titleSmall: barlow(fontSize: 14, fontWeight: FontWeight.w700, color: palette.textPrimary),
        bodyLarge: barlow(fontSize: 16, color: palette.textPrimary),
        bodyMedium: barlow(fontSize: 14, color: palette.textPrimary),
        bodySmall: barlow(fontSize: 12, color: palette.textMuted),
        labelLarge: barlow(fontSize: 14, fontWeight: FontWeight.w700, color: palette.textPrimary, letterSpacing: 1.5),
        labelMedium: barlow(fontSize: 12, fontWeight: FontWeight.w700, color: palette.textMuted, letterSpacing: 2),
        labelSmall: barlow(fontSize: 10, fontWeight: FontWeight.w700, color: palette.textMuted, letterSpacing: 2.5),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: palette.navBg,
        surfaceTintColor: Colors.transparent,
        foregroundColor: palette.textPrimary,
        elevation: 0,
        scrolledUnderElevation: 0,
        titleTextStyle: bebas(fontSize: 22, fontWeight: FontWeight.w700, color: palette.textPrimary, letterSpacing: 1.5),
        iconTheme: IconThemeData(color: palette.textPrimary, size: 22),
      ),
      cardTheme: CardThemeData(
        color: palette.bgSurface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: BorderSide(color: palette.border, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: VaadakaColors.brandRed,
          foregroundColor: Colors.white,
          disabledBackgroundColor: palette.bgSurface2,
          disabledForegroundColor: palette.textMuted,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          textStyle: barlow(fontSize: 13, fontWeight: FontWeight.w700, letterSpacing: 1.5),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: palette.textPrimary,
          side: BorderSide(color: palette.border),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          textStyle: barlow(fontSize: 13, fontWeight: FontWeight.w700, letterSpacing: 1.5),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: palette.highlight,
          textStyle: barlow(fontSize: 13, fontWeight: FontWeight.w700, letterSpacing: 1.5),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: palette.bgSurface2,
        hintStyle: barlow(fontSize: 14, color: palette.textMuted),
        labelStyle: barlow(fontSize: 11, fontWeight: FontWeight.w700, color: palette.textMuted, letterSpacing: 2),
        floatingLabelBehavior: FloatingLabelBehavior.always,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: BorderSide(color: palette.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: BorderSide(color: palette.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(color: VaadakaColors.brandRed, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(color: VaadakaColors.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: const BorderSide(color: VaadakaColors.error, width: 1.5),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: palette.bgSurface2,
        selectedColor: VaadakaColors.brandRed,
        labelStyle: barlow(fontSize: 11, fontWeight: FontWeight.w700, color: palette.textPrimary, letterSpacing: 1.5),
        side: BorderSide(color: palette.border),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: palette.bgSurface,
        contentTextStyle: barlow(fontSize: 14, color: palette.textPrimary),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: BorderSide(color: palette.border),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: palette.bgSurface,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: BorderSide(color: palette.border),
        ),
        titleTextStyle: bebas(fontSize: 22, fontWeight: FontWeight.w700, color: palette.textPrimary, letterSpacing: 1.2),
        contentTextStyle: barlow(fontSize: 14, color: palette.textPrimary),
      ),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: palette.bgSurface,
        surfaceTintColor: Colors.transparent,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: palette.bgSurface,
        selectedItemColor: VaadakaColors.brandRed,
        unselectedItemColor: palette.textMuted,
        selectedLabelStyle: barlow(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.5),
        unselectedLabelStyle: barlow(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.5),
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: VaadakaColors.brandRed,
      ),
      dividerTheme: DividerThemeData(color: palette.border, thickness: 1, space: 1),
      iconTheme: IconThemeData(color: palette.textPrimary, size: 20),
    );
  }
}
