import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/notifications/notifications_service.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_provider.dart';
import 'features/auth/auth_providers.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
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
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await ref.read(notificationsServiceProvider).init();
      // Register FCM token when a user is authenticated.
      ref.listen(authProvider, (prev, next) {
        if (next.isAuthenticated && prev?.isAuthenticated != true) {
          ref.read(notificationsServiceProvider).registerTokenIfNeeded();
        }
      });
      if (ref.read(authProvider).isAuthenticated) {
        await ref.read(notificationsServiceProvider).registerTokenIfNeeded();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isLight = ref.watch(isLightProvider);
    final router = ref.watch(routerProvider);

    SystemChrome.setSystemUIOverlayStyle(
      SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: isLight ? Brightness.dark : Brightness.light,
        systemNavigationBarColor: isLight ? Colors.white : Colors.black,
        systemNavigationBarIconBrightness: isLight ? Brightness.dark : Brightness.light,
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
