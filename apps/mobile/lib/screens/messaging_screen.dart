import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/api_service.dart';

final conversationsProvider = StateProvider<List<Map<String, dynamic>>>((ref) => []);
final selectedConversationProvider = StateProvider<Map<String, dynamic>?>((ref) => null);
final messagesProvider = StateProvider<List<Map<String, dynamic>>>((ref) => []);
final messageTextProvider = StateProvider<String>((ref) => '');
final isLoadingMessagesProvider = StateProvider<bool>((ref) => false);

class MessagingScreen extends ConsumerStatefulWidget {
  const MessagingScreen({super.key});

  @override
  ConsumerState<MessagingScreen> createState() => _MessagingScreenState();
}

class _MessagingScreenState extends ConsumerState<MessagingScreen> {
  @override
  void initState() {
    super.initState();
    _loadConversations();
  }

  @override
  Widget build(BuildContext context) {
    final conversations = ref.watch(conversationsProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: const Text('Messages'),
      ),
      body: conversations.isEmpty
          ? _buildEmptyState(context)
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: conversations.length,
              itemBuilder: (context, index) {
                final convo = conversations[index];
                return _ConversationTile(
                  conversation: convo,
                  onTap: () => _openConversation(context, convo),
                );
              },
            ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.chat_bubble_outline,
            size: 64,
            color: Theme.of(context).colorScheme.outline,
          ),
          const SizedBox(height: 16),
          Text(
            'No conversations',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Start a conversation with your doctor',
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Future<void> _loadConversations() async {
    try {
      final apiService = ApiService();
      final data = await apiService.getConversations();
      if (mounted) {
        ref.read(conversationsProvider.notifier).state = List.from(data);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load conversations: $e')),
        );
      }
    }
  }

  void _openConversation(BuildContext context, Map<String, dynamic> convo) {
    ref.read(selectedConversationProvider.notifier).state = convo;
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const ChatScreen()),
    );
  }
}

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _loadMessages();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final conversation = ref.watch(selectedConversationProvider);
    final messages = ref.watch(messagesProvider);
    final messageText = ref.watch(messageTextProvider);
    final isLoading = ref.watch(isLoadingMessagesProvider);

    if (conversation == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Messages')),
        body: const Center(child: Text('No conversation selected')),
      );
    }

    final participant = conversation['participant'] as Map<String, dynamic>?;
    final unreadCount = conversation['unreadCount'] as int? ?? 0;

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: Row(
          children: [
            if (unreadCount > 0)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.error,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '$unreadCount',
                  style: const TextStyle(color: Colors.white, fontSize: 12),
                ),
              ),
            const SizedBox(width: 8),
            Text(participant != null
                ? 'Dr. ${participant['firstName']} ${participant['lastName']}'
                : 'Chat'),
          ],
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : messages.isEmpty
              ? _buildEmptyChat(context)
              : Column(
                  children: [
                    Expanded(
                      child: ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: messages.length,
                        itemBuilder: (context, index) {
                          final msg = messages[index];
                          return _MessageBubble(message: msg);
                        },
                      ),
                    ),
                    _buildMessageInput(context, messageText),
                  ],
                ),
    );
  }

  Widget _buildEmptyChat(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.chat_outlined,
            size: 64,
            color: Theme.of(context).colorScheme.outline,
          ),
          const SizedBox(height: 16),
          Text(
            'No messages yet',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Start the conversation',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ],
      ),
    );
  }

  Widget _buildMessageInput(BuildContext context, String messageText) {
    return Container(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        top: 8,
        bottom: MediaQuery.of(context).viewInsets.bottom + 8,
      ),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          top: BorderSide(color: Theme.of(context).dividerColor),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _messageController,
              decoration: const InputDecoration(
                hintText: 'Type a message...',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              ),
              onChanged: (v) => ref.read(messageTextProvider.notifier).state = v,
              onSubmitted: (_) => _sendMessage(),
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.send),
            onPressed: _sendMessage,
            style: IconButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.primaryContainer,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _sendMessage() async {
    final text = ref.read(messageTextProvider.notifier).state;
    if (text.trim().isEmpty) return;

    ref.read(messageTextProvider.notifier).state = '';
    _messageController.clear();

    try {
      final apiService = ApiService();
      await apiService.sendMessage(
        conversationId: ref.read(selectedConversationProvider) ?? {},
        content: text.trim(),
      );

      final currentMessages = ref.read(messagesProvider.notifier).state;
      currentMessages.add({
        'id': 'temp-${DateTime.now().millisecondsSinceEpoch}',
        'content': text.trim(),
        'sender': 'PATIENT',
        'timestamp': DateTime.now().toIso8601String(),
      });
      if (mounted) {
        ref.read(messagesProvider.notifier).state = List.from(currentMessages);
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send message: $e')),
        );
      }
    }
  }

  Future<void> _loadMessages() async {
    ref.read(isLoadingMessagesProvider.notifier).state = true;
    try {
      final apiService = ApiService();
      final data = await apiService.getMessages(
        ref.read(selectedConversationProvider),
      );
      if (mounted) {
        ref.read(messagesProvider.notifier).state = List.from(data);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load messages: $e')),
        );
      }
    } finally {
      if (mounted) {
        ref.read(isLoadingMessagesProvider.notifier).state = false;
      }
    }
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      Future.delayed(const Duration(milliseconds: 100), () {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      });
    }
  }
}

class _ConversationTile extends StatelessWidget {
  final Map<String, dynamic> conversation;
  final VoidCallback onTap;
  const _ConversationTile({required this.conversation, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final participant = conversation['participant'] as Map<String, dynamic>?;
    final lastMessage = conversation['lastMessage'] as Map<String, dynamic>?;
    final unreadCount = conversation['unreadCount'] as int? ?? 0;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Badge(
          label: Text('$unreadCount'),
          isLabelVisible: unreadCount > 0,
          child: CircleAvatar(
            backgroundColor: Theme.of(context).colorScheme.primaryContainer,
            child: Icon(Icons.person,
                color: Theme.of(context).colorScheme.onPrimaryContainer),
          ),
        ),
        title: Text(
          participant != null
              ? 'Dr. ${participant['firstName']} ${participant['lastName']}'
              : 'Unknown',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (lastMessage != null)
              Text(
                lastMessage['content'] ?? '',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            if (lastMessage != null && lastMessage['timestamp'] != null)
              Text(
                _formatTimestamp(lastMessage['timestamp']),
                style: const TextStyle(fontSize: 12),
              ),
          ],
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }

  String _formatTimestamp(String timestamp) {
    final date = DateTime.tryParse(timestamp);
    if (date == null) return '';
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inDays == 0) {
      return 'Today';
    } else if (diff.inDays == 1) {
      return 'Yesterday';
    } else if (diff.inDays < 7) {
      return '${diff.inDays} days ago';
    } else {
      return '${date.month}/${date.day}/${date.year}';
    }
  }
}

class _MessageBubble extends StatelessWidget {
  final Map<String, dynamic> message;
  const _MessageBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final sender = message['sender'] as String?;
    final isPatient = sender == 'PATIENT';
    final timestamp = message['timestamp'] as String?;

    return Align(
      alignment: isPatient ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        decoration: BoxDecoration(
          color: isPatient
              ? Theme.of(context).colorScheme.primaryContainer
              : Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(message['content'] ?? ''),
            const SizedBox(height: 4),
            if (timestamp != null)
              Text(
                _formatTime(timestamp),
                style: TextStyle(
                  fontSize: 11,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
          ],
        ),
      ),
    );
  }

  String _formatTime(String timestamp) {
    final date = DateTime.tryParse(timestamp);
    if (date == null) return '';
    return '${date.hour}:${date.minute.toString().padLeft(2, '0')} ${date.hour < 12 ? 'AM' : 'PM'}';
  }
}
