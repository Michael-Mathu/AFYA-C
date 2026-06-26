import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../models/api_service.dart';

final prescriptionsProvider = StateProvider<List<Map<String, dynamic>>>((ref) => []);
final selectedPrescriptionProvider = StateProvider<Map<String, dynamic>?>((ref) => null);
final isLoadingPrescriptionsProvider = StateProvider<bool>((ref) => false);
final showRefillDialogProvider = StateProvider<bool>((ref) => false);

class PrescriptionsScreen extends ConsumerStatefulWidget {
  const PrescriptionsScreen({super.key});

  @override
  ConsumerState<PrescriptionsScreen> createState() =>
      _PrescriptionsScreenState();
}

class _PrescriptionsScreenState extends ConsumerState<PrescriptionsScreen> {
  @override
  void initState() {
    super.initState();
    _loadPrescriptions();
  }

  @override
  Widget build(BuildContext context) {
    final prescriptions = ref.watch(prescriptionsProvider);
    final isLoading = ref.watch(isLoadingPrescriptionsProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: const Text('Prescriptions'),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : prescriptions.isEmpty
              ? _buildEmptyState(context)
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: prescriptions.length,
                  itemBuilder: (context, index) {
                    final prescription = prescriptions[index];
                    return _PrescriptionCard(
                      prescription: prescription,
                      onTap: () => _showPrescriptionDetail(context, prescription),
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
            Icons.medication_outlined,
            size: 64,
            color: Theme.of(context).colorScheme.outline,
          ),
          const SizedBox(height: 16),
          Text(
            'No prescriptions',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Your prescriptions will appear after consultations',
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Future<void> _loadPrescriptions() async {
    ref.read(isLoadingPrescriptionsProvider.notifier).state = true;
    try {
      final apiService = ApiService();
      final data = await apiService.getPrescriptions();
      if (mounted) {
        ref.read(prescriptionsProvider.notifier).state = List.from(data);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load prescriptions: $e')),
        );
      }
    } finally {
      if (mounted) {
        ref.read(isLoadingPrescriptionsProvider.notifier).state = false;
      }
    }
  }

  void _showPrescriptionDetail(BuildContext context, Map<String, dynamic> prescription) {
    ref.read(selectedPrescriptionProvider.notifier).state = prescription;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.6,
          maxChildSize: 0.9,
          expand: false,
          builder: (context, scrollController) {
            final medications = prescription['medications'] as List<dynamic>? ?? [];
            return Container(
              padding: const EdgeInsets.all(20),
              child: ListView(
                controller: scrollController,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              prescription['doctorName'] ?? 'Unknown Doctor',
                              style: const TextStyle(fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              DateFormat('MMMM dd, yyyy').format(
                                DateTime.parse(prescription['prescriptionDate']),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Chip(
                        label: Text(prescription['status'] ?? 'Unknown'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Medications',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 12),
                  ...medications.map((med) {
                    final medication = med as Map<String, dynamic>;
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ExpansionTile(
                        leading: const Icon(Icons.medication),
                        title: Text(medication['name'] ?? 'Unknown'),
                        subtitle: Text('${medication['dosage']} • ${medication['frequency']}'),
                        children: [
                          Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildDetailRow('Frequency', medication['frequency']),
                                _buildDetailRow('Route', medication['route']),
                                _buildDetailRow('Duration', '${medication['durationDays']} days'),
                                _buildDetailRow('Quantity', '${medication['quantity']} tablets'),
                                if (medication['instructions'] != null &&
                                    medication['instructions'].toString().isNotEmpty)
                                  _buildDetailRow('Instructions', medication['instructions']),
                                if (medication['isAiSuggested'] == true)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 8),
                                    child: Chip(
                                      label: const Text('AI Suggested', style: TextStyle(fontSize: 12)),
                                      backgroundColor: Colors.purple.withOpacity(0.2),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                  const SizedBox(height: 16),
                  if (prescription['status'] != 'DISPENSED')
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          _requestRefill(prescription);
                        },
                        icon: const Icon(Icons.refresh),
                        label: const Text('Request Refill'),
                      ),
                    ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildDetailRow(String label, dynamic value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(child: Text(value?.toString() ?? 'N/A')),
        ],
      ),
    );
  }

  Future<void> _requestRefill(Map<String, dynamic> prescription) async {
    ref.read(showRefillDialogProvider.notifier).state = true;
    try {
      final apiService = ApiService();
      final response = await apiService.requestRefill(prescription['id']);
      if (response != null && response['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Refill requested successfully')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to request refill: $e')),
        );
      }
    } finally {
      ref.read(showRefillDialogProvider.notifier).state = false;
    }
  }
}

class _PrescriptionCard extends StatelessWidget {
  final Map<String, dynamic> prescription;
  final VoidCallback onTap;
  const _PrescriptionCard({required this.prescription, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final medications = prescription['medications'] as List<dynamic>? ?? [];
    final status = prescription['status'] as String? ?? 'Unknown';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: status == 'DISPENSED'
              ? Colors.green.withOpacity(0.2)
              : Colors.orange.withOpacity(0.2),
          child: Icon(
            status == 'DISPENSED' ? Icons.medication_outlined : Icons.pending_outlined,
            color: status == 'DISPENSED' ? Colors.green : Colors.orange,
          ),
        ),
        title: Text(
          medications.isNotEmpty ? medications.first['name'] ?? 'Prescription' : 'Prescription',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(prescription['doctorName'] ?? 'Unknown'),
            const SizedBox(height: 4),
            Text(
              DateFormat('MMMM dd, yyyy').format(
                DateTime.parse(prescription['prescriptionDate']),
              ),
              style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
            ),
            if (medications.length > 1)
              Text(
                '+${medications.length - 1} more medications',
                style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
              ),
          ],
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }
}
