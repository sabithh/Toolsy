import 'dart:async';

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
import '../auth/auth_providers.dart';
import 'chat_list_screen.dart';

final chatMessagesProvider =
    FutureProvider.autoDispose.family<List<ChatMessage>, String>((ref, bookingId) async {
  return ref.watch(apiServiceProvider).listMessages(bookingId);
});

class ChatDetailScreen extends ConsumerStatefulWidget {
  final String bookingId;
  const ChatDetailScreen({super.key, required this.bookingId});

  @override
  ConsumerState<ChatDetailScreen> createState() => _ChatDetailScreenState();
}

class _ChatDetailScreenState extends ConsumerState<ChatDetailScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  Timer? _pollTimer;
  bool _sending = false;

  @override
  void initState() {
    super.initState();
    _pollTimer = Timer.periodic(const Duration(seconds: 6), (_) {
      if (mounted) ref.invalidate(chatMessagesProvider(widget.bookingId));
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _sending) return;
    setState(() => _sending = true);
    try {
      await ref.read(apiServiceProvider).sendMessage(widget.bookingId, text);
      _controller.clear();
      ref.invalidate(chatMessagesProvider(widget.bookingId));
      ref.invalidate(chatRoomsProvider);
      await Future.delayed(const Duration(milliseconds: 200));
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);
    final me = ref.watch(authProvider).user;
    final async = ref.watch(chatMessagesProvider(widget.bookingId));

    return Scaffold(
      backgroundColor: palette.bgPrimary,
      appBar: BrandAppBar(
        title: 'Chat',
        leading: IconButton(
          icon: Icon(LucideIcons.arrowLeft, color: palette.textPrimary, size: 20),
          onPressed: () => context.canPop() ? context.pop() : context.go('/chats'),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: async.when(
              loading: () => const LoadingView(),
              error: (e, _) => EmptyStateView(
                icon: LucideIcons.alertTriangle,
                title: 'Failed to load',
                subtitle: e.toString(),
              ),
              data: (messages) {
                if (messages.isEmpty) {
                  return const EmptyStateView(
                    icon: LucideIcons.messageSquare,
                    title: 'No messages yet',
                    subtitle: 'Send the first message below.',
                  );
                }
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (_scrollController.hasClients) {
                    _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
                  }
                });
                return ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: messages.length,
                  itemBuilder: (_, i) {
                    final m = messages[i];
                    final isMine = me != null && m.senderId == me.id;
                    return _Bubble(message: m, isMine: isMine, palette: palette);
                  },
                );
              },
            ),
          ),
          _Composer(
            controller: _controller,
            sending: _sending,
            onSend: _send,
            palette: palette,
          ),
        ],
      ),
    );
  }
}

class _Bubble extends StatelessWidget {
  final ChatMessage message;
  final bool isMine;
  final VaadakaPalette palette;
  const _Bubble({required this.message, required this.isMine, required this.palette});

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('HH:mm');
    final bg = isMine ? VaadakaColors.brandRed : palette.bgSurface;
    final fg = isMine ? Colors.white : palette.textPrimary;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: isMine ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          ConstrainedBox(
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: bg,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(14),
                  topRight: const Radius.circular(14),
                  bottomLeft: Radius.circular(isMine ? 14 : 2),
                  bottomRight: Radius.circular(isMine ? 2 : 14),
                ),
                border: isMine ? null : Border.all(color: palette.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (!isMine && message.senderUsername.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 2),
                      child: Text(
                        message.senderUsername,
                        style: GoogleFonts.barlow(
                          fontSize: 10,
                          color: palette.textMuted,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1,
                        ),
                      ),
                    ),
                  Text(
                    message.message,
                    style: GoogleFonts.barlow(fontSize: 14, color: fg, height: 1.35),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    fmt.format(message.createdAt.toLocal()),
                    style: GoogleFonts.barlow(
                      fontSize: 9,
                      color: isMine ? Colors.white70 : palette.textMuted,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Composer extends StatelessWidget {
  final TextEditingController controller;
  final bool sending;
  final VoidCallback onSend;
  final VaadakaPalette palette;
  const _Composer({
    required this.controller,
    required this.sending,
    required this.onSend,
    required this.palette,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(12, 10, 12, MediaQuery.of(context).padding.bottom + 10),
      decoration: BoxDecoration(
        color: palette.bgSurface,
        border: Border(top: BorderSide(color: palette.border)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: palette.bgSurface2,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: palette.border),
              ),
              child: TextField(
                controller: controller,
                minLines: 1,
                maxLines: 4,
                cursorColor: VaadakaColors.brandRed,
                style: GoogleFonts.barlow(fontSize: 14, color: palette.textPrimary),
                decoration: InputDecoration(
                  hintText: 'Type a message...',
                  hintStyle: GoogleFonts.barlow(fontSize: 14, color: palette.textMuted),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                ),
                onSubmitted: (_) => onSend(),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Material(
            color: VaadakaColors.brandRed,
            shape: const CircleBorder(),
            child: InkWell(
              customBorder: const CircleBorder(),
              onTap: sending ? null : onSend,
              child: Container(
                width: 44,
                height: 44,
                alignment: Alignment.center,
                child: sending
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(LucideIcons.send, size: 18, color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
