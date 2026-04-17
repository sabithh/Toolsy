import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// User's chosen mode. Two brand themes (no classic dark).
enum VaadakaMode { red, light }

class ThemeNotifier extends StateNotifier<VaadakaMode> {
  ThemeNotifier() : super(VaadakaMode.light) {
    _load();
  }

  static const _key = 'vaadaka_mode';

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_key);
    if (saved == 'red') {
      state = VaadakaMode.red;
    } else {
      state = VaadakaMode.light;
    }
  }

  Future<void> toggle() async {
    state = state == VaadakaMode.light ? VaadakaMode.red : VaadakaMode.light;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, state == VaadakaMode.red ? 'red' : 'light');
  }

  bool get isLight => state == VaadakaMode.light;

  Brightness get systemOverlayBrightness =>
      state == VaadakaMode.light ? Brightness.dark : Brightness.light;
}

final themeProvider = StateNotifierProvider<ThemeNotifier, VaadakaMode>((ref) => ThemeNotifier());

final isLightProvider = Provider<bool>((ref) {
  return ref.watch(themeProvider) == VaadakaMode.light;
});
