import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_colors.dart';
import '../../core/widgets/vaadaka_logo.dart';
import 'auth_providers.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _fade;
  late final Animation<double> _scale;
  bool _navigated = false;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 900));
    _fade = CurvedAnimation(parent: _ctrl, curve: const Interval(0.0, 0.6, curve: Curves.easeOut));
    _scale = Tween<double>(begin: 0.75, end: 1.0).animate(
      CurvedAnimation(parent: _ctrl, curve: const Interval(0.0, 0.7, curve: Curves.easeOutCubic)),
    );
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _navigate(AuthState auth) {
    if (_navigated) return;
    if (auth.loading) return;
    _navigated = true;
    Future.delayed(const Duration(milliseconds: 300), () {
      if (!mounted) return;
      context.go(auth.isAuthenticated ? '/tools' : '/welcome');
    });
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(authProvider, (_, next) => _navigate(next));

    // Also check current state in case it's already resolved
    final auth = ref.watch(authProvider);
    if (!auth.loading && !_navigated) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _navigate(auth));
    }

    return Scaffold(
      backgroundColor: VaadakaColors.brandRed,
      body: Center(
        child: AnimatedBuilder(
          animation: _ctrl,
          builder: (_, _) => Opacity(
            opacity: _fade.value,
            child: Transform.scale(
              scale: _scale.value,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Icon: white V on transparent bg
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(22),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      'V',
                      style: GoogleFonts.bebasNeue(
                        fontSize: 60,
                        color: VaadakaColors.brandRed,
                        height: 1,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const VaadakaLogo(height: 44, showTagline: false, forceLight: true),
                  const SizedBox(height: 10),
                  Text(
                    'RENT ANYTHING NEAR YOU',
                    style: GoogleFonts.barlow(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: Colors.white70,
                      letterSpacing: 2.5,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
