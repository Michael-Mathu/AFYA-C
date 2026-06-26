import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../models/api_service.dart';

final appointmentsProvider = StateProvider<List<Map<String, dynamic>>>((ref) => []);
final selectedAppointmentStatusProvider = StateProvider<String?>((ref) => null);
final selectedDateProvider = StateProvider<DateTime?>((ref) => null);
final isLoadingAppointmentsProvider = StateProvider<bool>((ref) => false);
final showBookingDialogProvider = StateProvider<bool>((ref) => false);

class AppointmentsScreen extends ConsumerStatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  ConsumerState<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends ConsumerState<AppointmentsScreen> {
  final _formKey = GlobalKey<FormState>();
  final _reasonController = TextEditingController();
  final _notesController = TextEditingController();
  DateTime? _selectedDateTime;
  String _selectedDepartment = 'General';

  final List<String> _departments = [
    'General',
    'Pediatrics',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Dermatology',
  ];

  @override
  void dispose() {
    _reasonController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final appointments = ref.watch(appointmentsProvider);
    final selectedDate = ref.watch(selectedDateProvider);
    final isLoading = ref.watch(isLoadingAppointmentsProvider);
    final showBooking = ref.watch(showBookingDialogProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: const Text('Appointments'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () => _showFilterBottomSheet(context),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildCalendarHeader(context, selectedDate),
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : appointments.isEmpty
                    ? _buildEmptyState(context)
                    : RefreshIndicator(
                        onRefresh: _loadAppointments,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: appointments.length,
                          itemBuilder: (context, index) {
                            final apt = appointments[index];
                            return _AppointmentCard(appointment: apt);
                          },
                        ),
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          ref.read(showBookingDialogProvider.notifier).state = true;
        },
        icon: const Icon(Icons.add),
        label: const Text('Book Appointment'),
      ),
      bottomSheet: showBooking ? _buildBookingDialog(context) : null,
    );
  }

  Widget _buildCalendarHeader(BuildContext context, DateTime? selectedDate) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      color: Theme.of(context).colorScheme.surfaceContainerHighest,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: const Icon(Icons.chevron_left),
            onPressed: () {
              final newDate = DateTime(
                selectedDate?.year ?? DateTime.now().year,
                (selectedDate?.month ?? DateTime.now().month) - 1,
              );
              ref.read(selectedDateProvider.notifier).state = newDate;
            },
          ),
          Text(
            DateFormat('MMMM yyyy').format(selectedDate ?? DateTime.now()),
            style: Theme.of(context).textTheme.titleMedium,
          ),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            onPressed: () {
              final newDate = DateTime(
                selectedDate?.year ?? DateTime.now().year,
                (selectedDate?.month ?? DateTime.now().month) + 1,
              );
              ref.read(selectedDateProvider.notifier).state = newDate;
            },
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.calendar_today_outlined,
            size: 64,
            color: Theme.of(context).colorScheme.outline,
          ),
          const SizedBox(height: 16),
          Text(
            'No appointments',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Tap the button below to book an appointment',
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  void _showFilterBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        final statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
        final currentStatus = ref.watch(selectedAppointmentStatusProvider);
        return ListView(
          padding: const EdgeInsets.all(16),
          children: statuses.map((status) {
            return ListTile(
              title: Text(status),
              trailing: currentStatus == status
                  ? Icon(Icons.check, color: Theme.of(context).colorScheme.primary)
                  : null,
              onTap: () {
                ref.read(selectedAppointmentStatusProvider.notifier).state =
                    currentStatus == status ? null : status;
                Navigator.pop(context);
              },
            );
          }).toList(),
        );
      },
    );
  }

  Widget _buildBookingDialog(BuildContext context) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.7,
      ),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
      ),
      padding: const EdgeInsets.all(20),
      child: Form(
        key: _formKey,
        child: ListView(
          shrinkWrap: true,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Book Appointment',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () {
                    ref.read(showBookingDialogProvider.notifier).state = false;
                  },
                ),
              ],
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _selectedDepartment,
              decoration: const InputDecoration(
                labelText: 'Department',
                prefixIcon: Icon(Icons.local_hospital_outlined),
                border: OutlineInputBorder(),
              ),
              items: _departments
                  .map((d) => DropdownMenuItem(value: d, child: Text(d)))
                  .toList(),
              onChanged: (v) => _selectedDepartment = v ?? 'General',
            ),
            const SizedBox(height: 16),
            TextFormField(
              readOnly: true,
              decoration: const InputDecoration(
                labelText: 'Appointment Date & Time',
                prefixIcon: Icon(Icons.calendar_today_outlined),
                border: OutlineInputBorder(),
              ),
              controller: TextEditingController(
                text: _selectedDateTime == null
                    ? ''
                    : DateFormat('yyyy-MM-dd HH:mm').format(_selectedDateTime!),
              ),
              onTap: () async {
                final date = await showDatePicker(
                  context: context,
                  initialDate: DateTime.now().add(const Duration(days: 1)),
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 90)),
                );
                if (date == null) return;
                final time = await showTimePicker(
                  context: context,
                  initialTime: const TimeOfDay(hour: 9, minute: 0),
                );
                if (time == null) return;
                setState(() {
                  _selectedDateTime = DateTime(
                    date.year,
                    date.month,
                    date.day,
                    time.hour,
                    time.minute,
                  );
                });
              },
              validator: (v) => v == null || v.isEmpty
                  ? 'Please select appointment date and time'
                  : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _reasonController,
              decoration: const InputDecoration(
                labelText: 'Reason for Visit',
                prefixIcon: Icon(Icons.notes_outlined),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _notesController,
              decoration: const InputDecoration(
                labelText: 'Additional Notes',
                prefixIcon: Icon(Icons.edit_outlined),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              height: 48,
              child: FilledButton(
                onPressed: () => _handleBookAppointment(context),
                child: const Text('Book Appointment', style: TextStyle(fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleBookAppointment(BuildContext context) async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedDateTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select appointment date and time')),
      );
      return;
    }

    ref.read(isLoadingAppointmentsProvider.notifier).state = true;
    ref.read(showBookingDialogProvider.notifier).state = false;

    try {
      final apiService = ApiService();
      final response = await apiService.bookAppointment(
        appointmentDate: _selectedDateTime!,
        department: _selectedDepartment,
        type: 'SCHEDULED',
        reason: _reasonController.text.trim(),
        priority: 'ROUTINE',
        notes: _notesController.text.trim(),
      );

      if (response != null && response['id'] != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Appointment booked successfully')),
        );
        await _loadAppointments();
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Booking failed: $e')),
      );
    } finally {
      ref.read(isLoadingAppointmentsProvider.notifier).state = false;
    }
  }

  Future<void> _loadAppointments() async {
    ref.read(isLoadingAppointmentsProvider.notifier).state = true;
    try {
      final apiService = ApiService();
      final data = await apiService.getAppointments(
        status: ref.read(selectedAppointmentStatusProvider),
      );
      if (mounted) {
        ref.read(appointmentsProvider.notifier).state = List.from(data);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load appointments: $e')),
        );
      }
    } finally {
      if (mounted) {
        ref.read(isLoadingAppointmentsProvider.notifier).state = false;
      }
    }
  }
}

class _AppointmentCard extends StatelessWidget {
  final Map<String, dynamic> appointment;
  const _AppointmentCard({required this.appointment});

  @override
  Widget build(BuildContext context) {
    final doctor = appointment['doctor'] as Map<String, dynamic>?;
    final status = appointment['status'] as String;
    final dateStr = appointment['appointmentDate'] as String;
    final department = appointment['department'] as String;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: _getStatusColor(status),
          child: Icon(_getStatusIcon(status), color: Colors.white),
        ),
        title: Text(
          '$department • $status',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(doctor != null
                ? 'Dr. ${doctor['firstName']} ${doctor['lastName']}'
                : 'Unknown Doctor'),
            const SizedBox(height: 4),
            Text(
              DateFormat('MMM dd, yyyy • hh:mm a').format(DateTime.parse(dateStr)),
              style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
            ),
          ],
        ),
        trailing: appointment['videoLink'] != null
            ? IconButton(
                icon: const Icon(Icons.videocam_outlined),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Opening video link...')),
                  );
                },
              )
            : null,
        onTap: () => _showAppointmentDetails(context),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'CONFIRMED':
        return Colors.green;
      case 'PENDING':
        return Colors.orange;
      case 'COMPLETED':
        return Colors.blue;
      case 'CANCELLED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'CONFIRMED':
        return Icons.check;
      case 'PENDING':
        return Icons.hourglass_empty;
      case 'COMPLETED':
        return Icons.done_all;
      case 'CANCELLED':
        return Icons.cancel;
      default:
        return Icons.help_outline;
    }
  }

  void _showAppointmentDetails(BuildContext context) {
    final doctor = appointment['doctor'] as Map<String, dynamic>?;
    final queue = appointment['queueEntry'] as Map<String, dynamic>?;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.5,
          maxChildSize: 0.9,
          expand: false,
          builder: (context, scrollController) {
            return Container(
              padding: const EdgeInsets.all(20),
              child: ListView(
                controller: scrollController,
                children: [
                  Text(
                    'Appointment Details',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 16),
                  _DetailRow(
                    icon: Icons.calendar_today,
                    label: 'Date & Time',
                    value: DateFormat('EEEE, MMMM dd, yyyy • hh:mm a')
                        .format(DateTime.parse(appointment['appointmentDate'])),
                  ),
                  _DetailRow(
                    icon: Icons.local_hospital,
                    label: 'Department',
                    value: appointment['department'] ?? 'N/A',
                  ),
                  if (doctor != null)
                    _DetailRow(
                      icon: Icons.person,
                      label: 'Doctor',
                      value: 'Dr. ${doctor['firstName']} ${doctor['lastName']}',
                    ),
                  _DetailRow(
                    icon: Icons.category,
                    label: 'Status',
                    value: appointment['status'] ?? 'N/A',
                  ),
                  if (queue != null) ...[
                    _DetailRow(
                      icon: Icons.queue,
                      label: 'Queue Number',
                      value: '#${queue['queueNumber']}',
                    ),
                    _DetailRow(
                      icon: Icons.access_time,
                      label: 'Est. Wait Time',
                      value: '${queue['estimatedWaitTime']} mins',
                    ),
                  ],
                  if (appointment['notes'] != null &&
                      appointment['notes'].toString().isNotEmpty)
                    _DetailRow(
                      icon: Icons.notes,
                      label: 'Notes',
                      value: appointment['notes'],
                    ),
                  if (appointment['videoLink'] != null) ...[
                    const SizedBox(height: 16),
                    FilledButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Joining video consultation...')),
                        );
                      },
                      icon: const Icon(Icons.videocam),
                      label: const Text('Join Video Consultation'),
                    ),
                  ],
                ],
              ),
            );
          },
        );
      },
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _DetailRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: Theme.of(context).colorScheme.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(height: 2),
                Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
