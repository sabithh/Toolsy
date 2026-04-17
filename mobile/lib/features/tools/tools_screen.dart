import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../core/api/api_service.dart';
import '../../core/models/tool.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/widgets/brand_button.dart';
import '../../core/widgets/placeholder_screen.dart';
import '../../core/widgets/theme_toggle.dart';
import '../../core/widgets/vaadaka_logo.dart';
import '../auth/auth_providers.dart';

final _toolsSearchProvider = StateProvider<String>((_) => '');

final toolsListProvider = FutureProvider.autoDispose<List<Tool>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  final q = ref.watch(_toolsSearchProvider);
  return api.listTools(search: q.isEmpty ? null : q);
});

class ToolsScreen extends ConsumerStatefulWidget {
  const ToolsScreen({super.key});

  @override
  ConsumerState<ToolsScreen> createState() => _ToolsScreenState();
}

class _ToolsScreenState extends ConsumerState<ToolsScreen> {
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);
    final toolsAsync = ref.watch(toolsListProvider);
    final user = ref.watch(authProvider).user;

    return Scaffold(
      backgroundColor: palette.bgPrimary,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 8, 8),
              child: Row(
                children: [
                  const VaadakaLogo(height: 40, showTagline: false),
                  const Spacer(),
                  const ThemeToggle(),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Browse',
                    style: GoogleFonts.bebasNeue(fontSize: 44, color: palette.textPrimary, height: 0.9, letterSpacing: -0.5),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user == null
                        ? 'Explore what people are renting'
                        : 'Welcome back, ${user.displayName}',
                    style: GoogleFonts.barlow(fontSize: 12, color: palette.textMuted, fontWeight: FontWeight.w700, letterSpacing: 1.5),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                decoration: BoxDecoration(
                  color: palette.bgSurface2,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: palette.border),
                ),
                child: TextField(
                  controller: _searchController,
                  onSubmitted: (v) => ref.read(_toolsSearchProvider.notifier).state = v.trim(),
                  style: GoogleFonts.barlow(fontSize: 14, color: palette.textPrimary),
                  cursorColor: VaadakaColors.brandRed,
                  decoration: InputDecoration(
                    hintText: 'Search tools, equipment, gear...',
                    hintStyle: GoogleFonts.barlow(fontSize: 14, color: palette.textMuted),
                    prefixIcon: Icon(LucideIcons.search, size: 18, color: palette.textMuted),
                    suffixIcon: _searchController.text.isEmpty
                        ? null
                        : IconButton(
                            icon: Icon(LucideIcons.x, size: 16, color: palette.textMuted),
                            onPressed: () {
                              _searchController.clear();
                              ref.read(_toolsSearchProvider.notifier).state = '';
                              setState(() {});
                            },
                          ),
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 14),
                  ),
                  onChanged: (_) => setState(() {}),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: RefreshIndicator(
                color: VaadakaColors.brandRed,
                backgroundColor: palette.bgSurface,
                onRefresh: () async => ref.invalidate(toolsListProvider),
                child: toolsAsync.when(
                  data: (tools) {
                    if (tools.isEmpty) {
                      return ListView(children: const [
                        SizedBox(height: 80),
                        EmptyStateView(
                          icon: LucideIcons.packageOpen,
                          title: 'No Items Found',
                          subtitle: 'Try a different search or check back later.',
                        ),
                      ]);
                    }
                    return ListView.separated(
                      padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                      itemCount: tools.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 12),
                      itemBuilder: (_, i) => ToolCard(tool: tools[i]),
                    );
                  },
                  loading: () => const LoadingView(),
                  error: (e, _) => EmptyStateView(
                    icon: LucideIcons.alertTriangle,
                    title: 'Failed to Load',
                    subtitle: e.toString(),
                    action: BrandButton(
                      label: 'Retry',
                      icon: LucideIcons.refreshCw,
                      onPressed: () => ref.invalidate(toolsListProvider),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ToolCard extends ConsumerWidget {
  final Tool tool;
  const ToolCard({super.key, required this.tool});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);
    final image = tool.primaryImage;
    return Material(
      color: palette.bgSurface,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: () => context.push('/tools/${tool.id}'),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: palette.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(9)),
                child: image == null
                    ? Container(
                        height: 180,
                        color: palette.bgSurface2,
                        child: Center(child: Icon(LucideIcons.package, size: 40, color: palette.textMuted2)),
                      )
                    : CachedNetworkImage(
                        imageUrl: image,
                        fit: BoxFit.cover,
                        width: double.infinity,
                        height: 200,
                        placeholder: (_, _) => Container(height: 200, color: palette.bgSurface2),
                        errorWidget: (_, _, _) => Container(
                          height: 200,
                          color: palette.bgSurface2,
                          child: Center(child: Icon(LucideIcons.image, size: 32, color: palette.textMuted2)),
                        ),
                      ),
              ),
              Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        if (tool.categoryName != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: palette.bgSurface2,
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: palette.border),
                            ),
                            child: Text(
                              tool.categoryName!.toUpperCase(),
                              style: GoogleFonts.barlow(
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                                color: palette.textMuted,
                                letterSpacing: 1.5,
                              ),
                            ),
                          ),
                        const Spacer(),
                        if (tool.quantityAvailable > 0)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: VaadakaColors.success.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              '${tool.quantityAvailable} AVAILABLE',
                              style: GoogleFonts.barlow(
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                                color: VaadakaColors.success,
                                letterSpacing: 1.2,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(
                      tool.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.barlow(fontSize: 16, fontWeight: FontWeight.w800, color: palette.textPrimary),
                    ),
                    if (tool.shopName != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        tool.shopName!,
                        style: GoogleFonts.barlow(fontSize: 12, color: palette.textMuted, fontWeight: FontWeight.w600),
                      ),
                    ],
                    const SizedBox(height: 10),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          '₹${tool.displayPrice.toStringAsFixed(0)}',
                          style: GoogleFonts.bebasNeue(fontSize: 24, color: VaadakaColors.brandRed, letterSpacing: 1),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '/ ${tool.displayUnit}',
                          style: GoogleFonts.barlow(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: palette.textMuted,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
