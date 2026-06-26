import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../models/api_service.dart';

final labResultsProvider = StateProvider<List<Map<String, dynamic>>>((ref) => []);
final selectedLabResultProvider = StateProvider<Map<String, dynamic>?>((ref) => null);
final isLoadingLabResultsProvider = StateProvider<bool>((ref) => false);

class LabResultsScreen extends ConsumerStatefulWidget {
  const LabResultsScreen({super.key});

  @override
  ConsumerState<LabResultsScreen> createState() => _LabResultsScreenState();
}

class _LabResultsScreenState extends ConsumerState<LabResultsScreen> {
  @override
  void initState() {
    super.initState();
    _loadLabResults();
  }

  @override
  Widget build(BuildContext context) {
    final labResults = ref.watch(labResultsProvider);
    final isLoading = ref.watch(isLoadingLabResultsProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: const Text('Lab Results'),
        actions: [
          if (labResults.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.picture_as_pdf),
              onPressed: _exportAllToPdf,
              tooltip: 'Export PDF',
            ),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : labResults.isEmpty
              ? _buildEmptyState(context)
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: labResults.length,
                  itemBuilder: (context, index) {
                    final result = labResults[index];
                    return _LabResultCard(
                      result: result,
                      onTap: () => _showResultDetail(context, result),
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
            Icons.science_outlined,
            size: 64,
            color: Theme.of(context).colorScheme.outline,
          ),
          const SizedBox(height: 16),
          Text(
            'No lab results',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Your lab test results will appear here',
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Future<void> _loadLabResults() async {
    ref.read(isLoadingLabResultsProvider.notifier).state = true;
    try {
      final apiService = ApiService();
      final data = await apiService.getLabResults();
      if (mounted) {
        ref.read(labResultsProvider.notifier).state = List.from(data);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load lab results: $e')),
        );
      }
    } finally {
      if (mounted) {
        ref.read(isLoadingLabResultsProvider.notifier).state = false;
      }
    }
  }

  void _showResultDetail(BuildContext context, Map<String, dynamic> result) {
    ref.read(selectedLabResultProvider.notifier).state = result;
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const LabResultDetailScreen()),
    );
  }

  Future<void> _exportAllToPdf() async {
    try {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Exporting all results to PDF...')),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('PDF export failed: $e')),
        );
      }
    }
  }
}

class LabResultDetailScreen extends ConsumerWidget {
  const LabResultDetailScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final result = ref.watch(selectedLabResultProvider);
    if (result == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Lab Result')),
        body: const Center(child: Text('No result selected')),
      );
    }

    final resultData = result['result'] as Map<String, dynamic>? ?? {};
    final isAbnormal = resultData['isAbnormal'] as bool? ?? false;

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: const Text('Lab Result Detail'),
        actions: [
          IconButton(
            icon: const Icon(Icons.picture_as_pdf),
            onPressed: () => _exportToPdf(context, result),
            tooltip: 'Export to PDF',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildResultHeader(context, result, isAbnormal),
            const SizedBox(height: 20),
            _buildResultCard(context, result, resultData),
            const SizedBox(height: 16),
            if (resultData['note'] != null)
              _buildNoteCard(context, resultData['note']),
            const SizedBox(height: 16),
            _buildInfoSection(context, result),
          ],
        ),
      ),
    );
  }

  Widget _buildResultHeader(BuildContext context, Map<String, dynamic> result, bool isAbnormal) {
    return Card(
      color: isAbnormal
          ? Theme.of(context).colorScheme.errorContainer
          : Theme.of(context).colorScheme.primaryContainer,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(
              isAbnormal ? Icons.warning_amber_rounded : Icons.check_circle,
              size: 32,
              color: isAbnormal
                  ? Theme.of(context).colorScheme.onErrorContainer
                  : Theme.of(context).colorScheme.onPrimaryContainer,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    result['testName'] ?? 'Unknown',
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 18),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${result['category']} • ${result['priority']}',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultCard(BuildContext context, Map<String, dynamic> result, Map<String, dynamic> resultData) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Result Value',
              style: TextStyle(
                fontSize: 12,
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              resultData['value'] ?? 'Pending',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(
                  Icons.calendar_today,
                  size: 16,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: 8),
                Text(
                  'Resulted on: ${DateFormat('MMM dd, yyyy').format(DateTime.parse(result['resultDate']))}',
                  style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
                ),
              ],
            ),
            if (result['resultedByName'] != null) ...[
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.person, size: 16, color: Colors.grey),
                  const SizedBox(width: 8),
                  Text(
                    'Resulted by: ${result['resultedByName']}',
                    style: const TextStyle(fontSize: 14),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildNoteCard(BuildContext context, String note) {
    return Card(
      color: Theme.of(context).colorScheme.surfaceContainerHighest,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.notes, color: Theme.of(context).colorScheme.primary),
            const SizedBox(width: 12),
            Expanded(child: Text(note)),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoSection(BuildContext context, Map<String, dynamic> result) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Request Details',
              style: TextStyle(
                fontSize: 12,
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 8),
            _buildInfoRow('Test Name', result['testName']),
            _buildInfoRow('Category', result['category']),
            _buildInfoRow('Priority', result['priority']),
            _buildInfoRow('Status', result['status']),
            _buildInfoRow('Requested Date', result['requestedDate']),
            _buildInfoRow('Doctor', result['doctorName']),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, dynamic value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
          Text(value?.toString() ?? 'N/A'),
        ],
      ),
    );
  }

  Future<void> _exportToPdf(BuildContext context, Map<String, dynamic> result) async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Exporting to PDF...')),
    );
  }
}

class _LabResultCard extends StatelessWidget {
  final Map<String, dynamic> result;
  final VoidCallback onTap;
  const _LabResultCard({required this.result, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final resultData = result['result'] as Map<String, dynamic>? ?? {};
    final isAbnormal = resultData['isAbnormal'] as bool? ?? false;
    final status = result['status'] as String? ?? 'Unknown';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: isAbnormal
              ? Colors.orange.withOpacity(0.2)
              : Colors.green.withOpacity(0.2),
          child: Icon(
            isAbnormal ? Icons.warning_amber : Icons.check_circle,
            color: isAbnormal ? Colors.orange : Colors.green,
          ),
        ),
        title: Text(
          result['testName'] ?? 'Unknown',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              resultData['value'] ?? 'Pending',
              style: TextStyle(color: Theme.of(context).colorScheme.primary),
            ),
            const SizedBox(height: 4),
            Text(
              DateFormat('MMMM dd, yyyy').format(DateTime.parse(result['resultDate'])),
              style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
            ),
          ],
        ),
        trailing: Chip(
          label: Text(status),
          backgroundColor: (status == 'COMPLETED' ? Colors.green : Colors.blue)
              .withOpacity(0.2),
        ),
        onTap: onTap,
      ),
    );
  }
}
