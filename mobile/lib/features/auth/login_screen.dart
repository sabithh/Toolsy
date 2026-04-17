import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/widgets/brand_button.dart';
import '../../core/widgets/brand_text_field.dart';
import '../../core/widgets/theme_toggle.dart';
import '../../core/widgets/vaadaka_logo.dart';
import 'auth_providers.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscure = true;
  String? _error;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _error = null);
    if (!_formKey.currentState!.validate()) return;
    try {
      await ref.read(authProvider.notifier).login(
            _usernameController.text.trim(),
            _passwordController.text,
          );
      if (mounted) context.go('/tools');
    } catch (e) {
      setState(() => _error = ref.read(authProvider).error ?? e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);

    return Scaffold(
      backgroundColor: palette.bgPrimary,
      appBar: AppBar(
        backgroundColor: palette.bgPrimary,
        leading: IconButton(
          icon: Icon(LucideIcons.arrowLeft, color: palette.textPrimary),
          onPressed: () => context.canPop() ? context.pop() : context.go('/welcome'),
        ),
        actions: const [ThemeToggle(), SizedBox(width: 4)],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),
                const VaadakaLogo(height: 44, showTagline: false),
                const SizedBox(height: 40),
                Text(
                  'Welcome',
                  style: GoogleFonts.bebasNeue(fontSize: 56, color: palette.textPrimary, height: 0.9, letterSpacing: -1),
                ),
                Text(
                  'Back',
                  style: GoogleFonts.bebasNeue(fontSize: 56, color: palette.highlight, height: 0.9, letterSpacing: -1),
                ),
                const SizedBox(height: 12),
                Text(
                  'Sign in to your Vaadaka account.',
                  style: GoogleFonts.barlow(fontSize: 14, color: palette.textMuted, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 32),
                BrandTextField(
                  label: 'Username',
                  controller: _usernameController,
                  icon: LucideIcons.user,
                  hint: 'your_username',
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                ),
                const SizedBox(height: 20),
                BrandTextField(
                  label: 'Password',
                  controller: _passwordController,
                  icon: LucideIcons.lock,
                  obscure: _obscure,
                  hint: '••••••••',
                  textInputAction: TextInputAction.done,
                  onEditingComplete: _submit,
                  validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
                ),
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () => setState(() => _obscure = !_obscure),
                    child: Text(
                      _obscure ? 'SHOW PASSWORD' : 'HIDE PASSWORD',
                      style: GoogleFonts.barlow(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 2, color: palette.textMuted),
                    ),
                  ),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  _ErrorBanner(message: _error!),
                ],
                const SizedBox(height: 24),
                BrandButton(
                  label: 'Sign In',
                  icon: LucideIcons.logIn,
                  expand: true,
                  loading: auth.loading,
                  onPressed: auth.loading ? null : _submit,
                ),
                const SizedBox(height: 20),
                Center(
                  child: Wrap(
                    alignment: WrapAlignment.center,
                    children: [
                      Text(
                        "NEW HERE? ",
                        style: GoogleFonts.barlow(fontSize: 11, fontWeight: FontWeight.w700, color: palette.textMuted, letterSpacing: 2),
                      ),
                      GestureDetector(
                        onTap: () => context.go('/register'),
                        child: Text(
                          'CREATE ACCOUNT',
                          style: GoogleFonts.barlow(fontSize: 11, fontWeight: FontWeight.w800, color: VaadakaColors.brandRed, letterSpacing: 2),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ErrorBanner extends ConsumerWidget {
  final String message;
  const _ErrorBanner({required this.message});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: VaadakaColors.error.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: VaadakaColors.error.withValues(alpha: 0.4)),
      ),
      child: Row(
        children: [
          const Icon(LucideIcons.alertCircle, color: VaadakaColors.error, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: GoogleFonts.barlow(fontSize: 13, color: VaadakaColors.error, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}
