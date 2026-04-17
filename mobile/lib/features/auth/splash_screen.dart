import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_colors.dart';
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
  late final Animation<double> _taglineFade;
  bool _navigated = false;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _fade = CurvedAnimation(
      parent: _ctrl,
      curve: const Interval(0.0, 0.5, curve: Curves.easeOut),
    );
    _scale = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(
        parent: _ctrl,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOutCubic),
      ),
    );
    _taglineFade = CurvedAnimation(
      parent: _ctrl,
      curve: const Interval(0.5, 1.0, curve: Curves.easeOut),
    );
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _navigate(AuthState auth) {
    if (_navigated || auth.loading) return;
    _navigated = true;
    Future.delayed(const Duration(milliseconds: 400), () {
      if (mounted) context.go(auth.isAuthenticated ? '/tools' : '/welcome');
    });
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(authProvider, (_, next) => _navigate(next));
    final auth = ref.watch(authProvider);
    if (!auth.loading && !_navigated) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _navigate(auth));
    }

    return Scaffold(
      backgroundColor: VaadakaColors.brandRed,
      body: Center(
        child: AnimatedBuilder(
          animation: _ctrl,
          builder: (context, _) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Logo mark
              FadeTransition(
                opacity: _fade,
                child: ScaleTransition(
                  scale: _scale,
                  child: _LogoMark(),
                ),
              ),
              const SizedBox(height: 28),
              // Word mark: "വാDAKA." all white
              FadeTransition(
                opacity: _fade,
                child: ScaleTransition(
                  scale: _scale,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        'വാ',
                        style: GoogleFonts.notoSerifMalayalam(
                          fontSize: 32,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                          height: 1,
                        ),
                      ),
                      Text(
                        'DAKA',
                        style: GoogleFonts.bebasNeue(
                          fontSize: 38,
                          color: Colors.white,
                          letterSpacing: 2,
                          height: 1,
                        ),
                      ),
                      Text(
                        '.',
                        style: GoogleFonts.bebasNeue(
                          fontSize: 38,
                          color: Colors.white54,
                          height: 1,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 10),
              // Tagline fades in after logo
              FadeTransition(
                opacity: _taglineFade,
                child: Text(
                  'RENT ANYTHING NEAR YOU',
                  style: GoogleFonts.barlow(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Colors.white54,
                    letterSpacing: 3,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LogoMark extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 88,
      height: 88,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      alignment: Alignment.center,
      child: CustomPaint(
        size: const Size(52, 52),
        painter: _VPainter(),
      ),
    );
  }
}

class _VPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = VaadakaColors.brandRed
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width * 0.14
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final w = size.width;
    final h = size.height;
    final path = Path()
      ..moveTo(w * 0.18, h * 0.22)
      ..lineTo(w * 0.5, h * 0.78)
      ..lineTo(w * 0.82, h * 0.22);
    canvas.drawPath(path, paint);

    canvas.drawCircle(
      Offset(w * 0.18, h * 0.22),
      w * 0.11,
      Paint()..color = VaadakaColors.brandRed,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter _) => false;
}
