import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../models/api_service.dart';

final medicalRecordsProvider = StateProvider<List<Map<String, dynamic>>>((ref) => []);
final selectedRecordProvider = StateProvider<Map<String, dynamic>?>((ref) => null);
final isLoadingRecordsProvider = StateProvider<bool>((ref) => false);

class MedicalRecordsScreen extends ConsumerStatefulWidget {
  const MedicalRecordsScreen({super.key});

  @override
  ConsumerState<MedicalRecordsScreen> createState() =>
      _MedicalRecordsScreenState();
}

class _MedicalRecordsScreenState extends ConsumerState<MedicalRecordsScreen> {
  @override
  void initState() {
    super.initState();
    _loadRecords();
  }

  @override
  Widget build(BuildContext context) {
    final records = ref.watch(medicalRecordsProvider);
    final isLoading = ref.watch(isLoadingRecordsProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: const Text('Medical Records'),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : records.isEmpty
              ? _buildEmptyState(context)
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: records.length,
                  itemBuilder: (context, index) {
                    final record = records[index];
                    return _RecordCard(
                      record: record,
                      onTap: () => _showRecordDetail(context, record),
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
            Icons.folder_open_outlined,
            size: 64,
            color: Theme.of(context).colorScheme.outline,
          ),
          const SizedBox(height: 16),
          Text(
            'No medical records',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Your consultation history will appear here',
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Future<void> _loadRecords() async {
    ref.read(isLoadingRecordsProvider.notifier).state = true;
    try {
      final apiService = ApiService();
      final data = await apiService.getMedicalRecords();
      if (mounted) {
        ref.read(medicalRecordsProvider.notifier).state = List.from(data);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load records: $e')),
        );
      }
    } finally {
      if (mounted) {
        ref.read(isLoadingRecordsProvider.notifier).state = false;
      }
    }
  }

  void _showRecordDetail(BuildContext context, Map<String, dynamic> record) {
    ref.read(selectedRecordProvider.notifier).state = record;
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const RecordDetailScreen(),
      ),
    );
  }
}

class RecordDetailScreen extends ConsumerWidget {
  const RecordDetailScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final record = ref.watch(selectedRecordProvider);
    if (record == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Record Detail')),
        body: const Center(child: Text('No record selected')),
      );
    }

    final doctor = record['doctor'] as Map<String, dynamic>?;
    final diagnoses = record['diagnoses'] as List<dynamic>? ?? [];
    final prescriptions = record['prescriptions'] as List<dynamic>? ?? [];
    final labRequests = record['labRequests'] as List<dynamic>? ?? [];
    final followUpDate = record['followUpDate'] as String?;

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: const Text('Consultation Detail'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(context, doctor, record),
            const SizedBox(height: 24),
            _buildSection(
              context,
              title: 'SOAP Notes',
              icon: Icons.medical_information_outlined,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSoapRow(context, 'Subjective', record['subjective'] ?? 'Patient reports...'),
                  const SizedBox(height: 8),
                  _buildSoapRow(context, 'Objective', record['objective'] ?? 'Examination findings...'),
                  const SizedBox(height: 8),
                  _buildSoapRow(context, 'Assessment', record['assessment'] ?? 'Clinical assessment...'),
                  const SizedBox(height: 8),
                  _buildSoapRow(context, 'Plan', record['plan'] ?? 'Treatment plan...'),
                ],
              ),
            ),
            const SizedBox(height: 16),
            if (diagnoses.isNotEmpty)
              _buildSection(
                context,
                title: 'Diagnoses',
                icon: Icons.assignment_outlined,
                child: ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: diagnoses.length,
                  itemBuilder: (context, index) {
                    final diag = diagnoses[index] as Map<String, dynamic>;
                    return ListTile(
                      dense: true,
                      leading: const Icon(Icons.health_and_safety_outlined),
                      title: Text(diag['description'] ?? 'Unknown'),
                      subtitle: Text('ICD-10: ${diag['icdCode']}'),
                    );
                  },
                ),
              ),
            const SizedBox(height: 16),
            if (prescriptions.isNotEmpty)
              _buildSection(
                context,
                title: 'Prescriptions',
                icon: Icons.medication_outlined,
                child: ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: prescriptions.length,
                  itemBuilder: (context, index) {
                    final med = prescriptions[index] as Map<String, dynamic>;
                    return ListTile(
                      dense: true,
                      leading: const Icon(Icons.medication_outlined),
                      title: Text(med['medicationName'] ?? 'Unknown'),
                      subtitle: Text(
                        '${med['dosage']} • ${med['frequency']} • ${med['durationDays']} days',
                      ),
                    );
                  },
                ),
              ),
            const SizedBox(height: 16),
            if (labRequests.isNotEmpty)
              _buildSection(
                context,
                title: 'Lab Requests',
                icon: Icons.science_outlined,
                child: ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: labRequests.length,
                  itemBuilder: (context, index) {
                    final lab = labRequests[index] as Map<String, dynamic>;
                    return ListTile(
                      dense: true,
                      leading: Icon(
                        lab['isAbnormal'] == true
                            ? Icons.warning_amber_rounded
                            : Icons.check_circle_outline,
                        color: lab['isAbnormal'] == true ? Colors.orange : Colors.green,
                      ),
                      title: Text(lab['testName'] ?? 'Unknown'),
                      subtitle: Text(
                        '${lab['status']} • ${lab['resultValue']}',
                      ),
                      trailing: lab['status'] == 'COMPLETED'
                          ? TextButton(
                              onPressed: () {},
                              child: const Text('View'),
                            )
                          : null,
                    );
                  },
                ),
              ),
            if (followUpDate != null) ...[
              const SizedBox(height: 16),
              _buildSection(
                context,
                title: 'Follow Up',
                icon: Icons.event_available_outlined,
                child: Text(
                  DateFormat('MMMM dd, yyyy').format(DateTime.parse(followUpDate)),
                  style: const TextStyle(fontSize: 16),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, Map<String, dynamic>? doctor, Map<String, dynamic> record) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              radius: 24,
              backgroundColor: Theme.of(context).colorScheme.primaryContainer,
              child: Icon(
                Icons.person,
                color: Theme.of(context).colorScheme.onPrimaryContainer,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    doctor != null
                        ? 'Dr. ${doctor['firstName']} ${doctor['lastName']}'
                        : 'Unknown Doctor',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 4),
                  if (doctor != null && doctor['specialization'] != null)
                    Text(
                      doctor['specialization'],
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  const SizedBox(height: 4),
                  Text(
                    DateFormat('MMMM dd, yyyy').format(DateTime.parse(record['consultationDate'])),
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            Chip(
              label: Text(record['status'] ?? 'Unknown'),
              backgroundColor:
                  (record['status'] == 'COMPLETED' ? Colors.green : Colors.blue)
                      .withOpacity(0.2),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(BuildContext context,
      {required String title, required IconData icon, required Widget child}) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 20, color: Theme.of(context).colorScheme.primary),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                ),
              ],
            ),
            const SizedBox(height: 12),
            child,
          ],
        ),
      ),
    );
  }

  Widget _buildSoapRow(BuildContext context, String label, String content) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(child: Text(content)),
        ],
      ),
    );
  }
}

class _RecordCard extends StatelessWidget {
  final Map<String, dynamic> record;
  final VoidCallback onTap;
  const _RecordCard({required this.record, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final doctor = record['doctor'] as Map<String, dynamic>?;
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Theme.of(context).colorScheme.primaryContainer,
          child: Icon(Icons.assignment_outlined,
              color: Theme.of(context).colorScheme.onPrimaryContainer),
        ),
        title: Text(
          doctor != null ? 'Dr. ${doctor['firstName']} ${doctor['lastName']}' : 'Consultation',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              DateFormat('MMMM dd, yyyy').format(DateTime.parse(record['consultationDate'])),
            ),
            if (record['followUpDate'] != null)
              Text(
                'Follow-up: ${DateFormat('MMM dd').format(DateTime.parse(record['followUpDate']))}',
                style: TextStyle(color: Theme.of(context).colorScheme.primary),
              ),
          ],
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }
}
