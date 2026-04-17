import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../theme/app_colors.dart';
import '../theme/theme_provider.dart';

/// Vaadaka brand logo — Malayalam "വാ" + "DAKA.", matching the web navbar.
class VaadakaLogo extends ConsumerWidget {
  final double height;
  final bool showTagline;
  /// Force white text/icon regardless of theme (use on red backgrounds).
  final bool forceLight;

  const VaadakaLogo({super.key, this.height = 44, this.showTagline = true, this.forceLight = false});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLight = forceLight ? true : ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);

    // On a red background (forceLight) use white icon box + white text
    final iconBg = forceLight ? Colors.white : (isLight ? VaadakaColors.brandRed : VaadakaColors.brandBlack);
    final vStroke = forceLight ? VaadakaColors.brandRed : (isLight ? Colors.white : VaadakaColors.brandRed);
    final textColor = forceLight ? Colors.white : palette.textPrimary;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: height,
          height: height,
          decoration: BoxDecoration(
            color: iconBg,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Center(
            child: SizedBox(
              width: height * 0.73,
              height: height * 0.73,
              child: CustomPaint(painter: _VMarkPainter(stroke: vStroke)),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisSize: MainAxisSize.min,
              children: [
                // "വാ" in red on light bg, white on red brand bg
                Text(
                  'വാ',
                  style: GoogleFonts.notoSerifMalayalam(
                    fontSize: height * 0.52,
                    fontWeight: FontWeight.w700,
                    color: forceLight ? Colors.white : (isLight ? VaadakaColors.brandRed : Colors.white),
                    height: 1,
                  ),
                ),
                Text(
                  'DAKA',
                  style: GoogleFonts.bebasNeue(
                    fontSize: height * 0.58,
                    color: textColor,
                    letterSpacing: 1.2,
                    height: 1,
                  ),
                ),
                Text(
                  '.',
                  style: GoogleFonts.bebasNeue(
                    fontSize: height * 0.58,
                    color: forceLight ? Colors.white54 : (isLight ? VaadakaColors.brandRed : Colors.white54),
                    height: 1,
                  ),
                ),
              ],
            ),
            if (showTagline) ...[
              const SizedBox(height: 2),
              Text(
                'RENT · KERALA',
                style: GoogleFonts.barlow(
                  fontSize: height * 0.18,
                  fontWeight: FontWeight.w600,
                  color: palette.textMuted,
                  letterSpacing: 3,
                ),
              ),
            ],
          ],
        ),
      ],
    );
  }
}

class _VMarkPainter extends CustomPainter {
  final Color stroke;
  _VMarkPainter({required this.stroke});

  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = stroke
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
    canvas.drawPath(path, p);

    // Eyelet
    final eyeletOuter = Paint()..color = stroke;
    canvas.drawCircle(Offset(w * 0.18, h * 0.22), w * 0.11, eyeletOuter);
  }

  @override
  bool shouldRepaint(covariant _VMarkPainter old) => old.stroke != stroke;
}
