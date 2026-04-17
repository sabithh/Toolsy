import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../core/api/api_service.dart';
import '../../core/models/tool.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/widgets/placeholder_screen.dart';

final chatRoomsProvider = FutureProvider.autoDispose<List<ChatRoomSummary>>((ref) async {
  return ref.watch(apiServiceProvider).listChatRooms();
});

class ChatListScreen extends ConsumerWidget {
  const ChatListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);
    final async = ref.watch(chatRoomsProvider);

    return Scaffold(
      backgroundColor: palette.bgPrimary,
      appBar: BrandAppBar(
        title: 'Messages',
        actions: [
          IconButton(
            icon: Icon(LucideIcons.refreshCw, color: palette.textPrimary, size: 18),
            onPressed: () => ref.invalidate(chatRoomsProvider),
          ),
        ],
      ),
      body: async.when(
        loading: () => const LoadingView(),
        error: (e, _) => EmptyStateView(
          icon: LucideIcons.alertTriangle,
          title: 'Failed to load',
          subtitle: e.toString(),
        ),
        data: (rooms) {
          if (rooms.isEmpty) {
            return const EmptyStateView(
              icon: LucideIcons.messageCircle,
              title: 'No conversations',
              subtitle: 'Book an item to start chatting with the owner.',
            );
          }
          return RefreshIndicator(
            color: VaadakaColors.brandRed,
            backgroundColor: palette.bgSurface,
            onRefresh: () async => ref.invalidate(chatRoomsProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(12),
              itemCount: rooms.length,
              separatorBuilder: (_, _) => const SizedBox(height: 8),
              itemBuilder: (_, i) => _RoomTile(room: rooms[i], palette: palette),
            ),
          );
        },
      ),
    );
  }
}

class _RoomTile extends StatelessWidget {
  final ChatRoomSummary room;
  final VaadakaPalette palette;
  const _RoomTile({required this.room, required this.palette});

  String _timeLabel(DateTime? t) {
    if (t == null) return '';
    final now = DateTime.now();
    final local = t.toLocal();
    final diff = now.difference(local);
    if (diff.inDays > 0) return DateFormat('MMM d').format(local);
    if (diff.inHours > 0) return '${diff.inHours}h';
    if (diff.inMinutes > 0) return '${diff.inMinutes}m';
    return 'now';
  }

  @override
  Widget build(BuildContext context) {
    final hasUnread = room.unreadCount > 0;
    return Material(
      color: palette.bgSurface,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: () => context.push('/chats/${room.bookingId}'),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: palette.border),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: VaadakaColors.brandRed.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Icon(LucideIcons.messageCircle, color: VaadakaColors.brandRed, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            room.itemName ?? 'Chat',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.barlow(
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                              color: palette.textPrimary,
                            ),
                          ),
                        ),
                        Text(
                          _timeLabel(room.lastMessageTime),
                          style: GoogleFonts.barlow(
                            fontSize: 10,
                            color: palette.textMuted,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            room.lastMessage ?? 'Tap to open conversation',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.barlow(
                              fontSize: 12,
                              color: hasUnread ? palette.textPrimary : palette.textMuted,
                              fontWeight: hasUnread ? FontWeight.w700 : FontWeight.w500,
                            ),
                          ),
                        ),
                        if (hasUnread) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: VaadakaColors.brandRed,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '${room.unreadCount}',
                              style: GoogleFonts.barlow(
                                fontSize: 10,
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ],
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
