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

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _username = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  final _firstName = TextEditingController();
  final _phone = TextEditingController();
  String _role = 'renter';
  bool _obscure = true;
  String? _error;

  @override
  void dispose() {
    for (final c in [_username, _email, _password, _confirm, _firstName, _phone]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _error = null);
    if (!_formKey.currentState!.validate()) return;
    try {
      await ref.read(authProvider.notifier).register(
            username: _username.text.trim(),
            email: _email.text.trim(),
            password: _password.text,
            userType: _role,
            firstName: _firstName.text.trim(),
            phone: _phone.text.trim(),
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
                const VaadakaLogo(height: 40, showTagline: false),
                const SizedBox(height: 32),
                Text('Join',
                    style: GoogleFonts.bebasNeue(fontSize: 56, color: palette.textPrimary, height: 0.9, letterSpacing: -1)),
                Text('Vaadaka',
                    style: GoogleFonts.bebasNeue(fontSize: 56, color: palette.highlight, height: 0.9, letterSpacing: -1)),
                const SizedBox(height: 12),
                Text(
                  'Create your account in under a minute.',
                  style: GoogleFonts.barlow(fontSize: 14, color: palette.textMuted, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 28),

                // Role selector
                Text('I WANT TO',
                    style: GoogleFonts.barlow(fontSize: 11, fontWeight: FontWeight.w800, color: palette.textMuted, letterSpacing: 2)),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: _RoleChip(
                        label: 'Rent Items',
                        icon: LucideIcons.shoppingBag,
                        selected: _role == 'renter',
                        palette: palette,
                        onTap: () => setState(() => _role = 'renter'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _RoleChip(
                        label: 'List Items',
                        icon: LucideIcons.tag,
                        selected: _role == 'provider',
                        palette: palette,
                        onTap: () => setState(() => _role = 'provider'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                BrandTextField(
                  label: 'First Name',
                  controller: _firstName,
                  icon: LucideIcons.user,
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                ),
                const SizedBox(height: 16),
                BrandTextField(
                  label: 'Username',
                  controller: _username,
                  icon: LucideIcons.atSign,
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Required';
                    if (v.length < 3) return 'Too short';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                BrandTextField(
                  label: 'Email',
                  controller: _email,
                  icon: LucideIcons.mail,
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Required';
                    final emailRe = RegExp(r'^[\w.+\-]+@[\w\-]+\.[a-zA-Z]{2,}$');
                    if (!emailRe.hasMatch(v.trim())) return 'Invalid email';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                BrandTextField(
                  label: 'Phone',
                  controller: _phone,
                  icon: LucideIcons.phone,
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 16),
                BrandTextField(
                  label: 'Password',
                  controller: _password,
                  icon: LucideIcons.lock,
                  obscure: _obscure,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Required';
                    if (v.length < 8) return 'Min 8 chars';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                BrandTextField(
                  label: 'Confirm Password',
                  controller: _confirm,
                  icon: LucideIcons.lock,
                  obscure: _obscure,
                  textInputAction: TextInputAction.done,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Required';
                    if (v != _password.text) return 'Passwords do not match';
                    return null;
                  },
                ),
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () => setState(() => _obscure = !_obscure),
                    child: Text(
                      _obscure ? 'SHOW PASSWORDS' : 'HIDE PASSWORDS',
                      style: GoogleFonts.barlow(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 2, color: palette.textMuted),
                    ),
                  ),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: VaadakaColors.error.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: VaadakaColors.error.withValues(alpha: 0.4)),
                    ),
                    child: Text(_error!,
                        style: GoogleFonts.barlow(fontSize: 13, color: VaadakaColors.error, fontWeight: FontWeight.w600)),
                  ),
                ],
                const SizedBox(height: 24),
                BrandButton(
                  label: 'Create Account',
                  icon: LucideIcons.userPlus,
                  expand: true,
                  loading: auth.loading,
                  onPressed: auth.loading ? null : _submit,
                ),
                const SizedBox(height: 20),
                Center(
                  child: Wrap(
                    alignment: WrapAlignment.center,
                    children: [
                      Text('ALREADY REGISTERED? ',
                          style: GoogleFonts.barlow(fontSize: 11, fontWeight: FontWeight.w700, color: palette.textMuted, letterSpacing: 2)),
                      GestureDetector(
                        onTap: () => context.go('/login'),
                        child: Text('SIGN IN',
                            style: GoogleFonts.barlow(fontSize: 11, fontWeight: FontWeight.w800, color: VaadakaColors.brandRed, letterSpacing: 2)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _RoleChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;
  final VaadakaPalette palette;

  const _RoleChip({required this.label, required this.icon, required this.selected, required this.onTap, required this.palette});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          decoration: BoxDecoration(
            color: selected ? VaadakaColors.brandRed : palette.bgSurface2,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: selected ? VaadakaColors.brandRed : palette.border),
          ),
          child: Column(
            children: [
              Icon(icon, color: selected ? Colors.white : palette.textPrimary, size: 22),
              const SizedBox(height: 8),
              Text(
                label.toUpperCase(),
                style: GoogleFonts.barlow(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: selected ? Colors.white : palette.textPrimary,
                  letterSpacing: 1.5,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
