import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/notifications/notifications_service.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_provider.dart';
import 'features/auth/auth_providers.dart';

Future<void> main() async {
  final binding = WidgetsFlutterBinding.ensureInitialized();
  // Keep native red splash visible until Flutter paints its first frame.
  FlutterNativeSplash.preserve(widgetsBinding: binding);
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  runApp(const ProviderScope(child: VaadakaApp()));
}

class VaadakaApp extends ConsumerStatefulWidget {
  const VaadakaApp({super.key});

  @override
  ConsumerState<VaadakaApp> createState() => _VaadakaAppState();
}

class _VaadakaAppState extends ConsumerState<VaadakaApp> {
  @override
  void initState() {
    super.initState();
    _initNotifications();
  }

  Future<void> _initNotifications() async {
    await ref.read(notificationsServiceProvider).init();
    if (!mounted) return;
    if (ref.read(authProvider).isAuthenticated) {
      await ref.read(notificationsServiceProvider).registerTokenIfNeeded();
    }
  }

  @override
  Widget build(BuildContext context) {
    // ConsumerState.ref.listen is only valid during build in Riverpod.
    ref.listen(authProvider, (prev, next) {
      if (next.isAuthenticated && prev?.isAuthenticated != true) {
        ref.read(notificationsServiceProvider).registerTokenIfNeeded();
      }
    });

    final isLight = ref.watch(isLightProvider);
    final router = ref.watch(routerProvider);

    SystemChrome.setSystemUIOverlayStyle(
      SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: isLight ? Brightness.dark : Brightness.light,
        systemNavigationBarColor: isLight ? Colors.white : Colors.black,
        systemNavigationBarIconBrightness: isLight
            ? Brightness.dark
            : Brightness.light,
      ),
    );

    return MaterialApp.router(
      title: 'Vaadaka',
      debugShowCheckedModeBanner: false,
      theme: isLight ? VaadakaTheme.light() : VaadakaTheme.red(),
      routerConfig: router,
    );
  }
}
