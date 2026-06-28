import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../models/api_service.dart';

final doctorsProvider = FutureProvider<List<dynamic>>((ref) async {
  return [];
});

final selectedDateProvider = StateProvider<DateTime?>((ref) => null);
final selectedDoctorProvider = StateProvider<Map<String, dynamic>?>((ref) => null);

class AppointmentBookingScreen extends ConsumerStatefulWidget {
  const AppointmentBookingScreen({super.key});

  @override
  ConsumerState<AppointmentBookingScreen> createState() =>
      _AppointmentBookingScreenState();
}

class _AppointmentBookingScreenState extends ConsumerState<AppointmentBookingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _reasonController = TextEditingController();
  final _notesController = TextEditingController();
  int _currentStep = 0;

  @override
  void dispose() {
    _reasonController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final selectedDate = ref.watch(selectedDateProvider);
    final selectedDoctor = ref.watch(selectedDoctorProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Book Appointment'),
      ),
      body: Stepper(
        currentStep: _currentStep,
        onStepContinue: () {
          if (_currentStep < 2) {
            setState(() => _currentStep++);
          } else {
            _submitBooking();
          }
        },
        onStepCancel: () {
          if (_currentStep > 0) {
            setState(() => _currentStep--);
          }
        },
        steps: [
          Step(
            title: const Text('Select Date'),
            content: _buildDatePicker(context, selectedDate),
            isActive: _currentStep >= 0,
            state: _currentStep > 0 ? StepState.complete : StepState.indexed,
          ),
          Step(
            title: const Text('Select Doctor'),
            content: _buildDoctorSelection(context, selectedDoctor),
            isActive: _currentStep >= 1,
            state: _currentStep > 1 ? StepState.complete : StepState.indexed,
          ),
          Step(
            title: const Text('Appointment Details'),
            content: _buildDetailsForm(context),
            isActive: _currentStep >= 2,
          ),
        ],
      ),
    );
  }

  Widget _buildDatePicker(BuildContext context, DateTime? selectedDate) {
    return Column(
      children: [
        Card(
          child: ListTile(
            leading: const Icon(Icons.calendar_today),
            title: Text(
              selectedDate != null
                  ? DateFormat('EEEE, MMMM d, yyyy').format(selectedDate)
                  : 'Select a date',
            ),
            trailing: const Icon(Icons.arrow_forward_ios),
            onTap: () async {
              final date = await showDatePicker(
                context: context,
                initialDate: selectedDate ?? DateTime.now(),
                firstDate: DateTime.now(),
                lastDate: DateTime.now().add(const Duration(days: 90)),
              );
              if (date != null) {
                ref.read(selectedDateProvider.notifier).state = date;
              }
            },
          ),
        ),
        if (selectedDate != null) ...[
          const SizedBox(height: 16),
          Text(
            'Selected: ${DateFormat('EEEE, MMMM d, yyyy').format(selectedDate)}',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Theme.of(context).colorScheme.primary,
                  fontWeight: FontWeight.w500,
                ),
          ),
        ],
      ],
    );
  }

  Widget _buildDoctorSelection(BuildContext context, Map<String, dynamic>? selectedDoctor) {
    return Column(
      children: [
        if (selectedDoctor != null)
          Card(
            child: ListTile(
              leading: CircleAvatar(
                child: Text(
                  '${selectedDoctor['firstName']?[0] ?? ''}${selectedDoctor['lastName']?[0] ?? ''}',
                ),
              ),
              title: Text(
                'Dr. ${selectedDoctor['firstName']} ${selectedDoctor['lastName']}',
              ),
              subtitle: Text(selectedDoctor['specialization'] ?? 'General Practice'),
              trailing: IconButton(
                icon: const Icon(Icons.close),
                onPressed: () {
                  ref.read(selectedDoctorProvider.notifier).state = null;
                },
              ),
            ),
          )
        else
          const Card(
            child: ListTile(
              leading: Icon(Icons.person_add),
              title: Text('Tap to select a doctor'),
              subtitle: Text('Choose from available doctors'),
            ),
          ),
      ],
    );
  }

  Widget _buildDetailsForm(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          TextFormField(
            controller: _reasonController,
            decoration: const InputDecoration(
              labelText: 'Reason for Visit',
              hintText: 'e.g., Annual checkup, Follow-up',
              border: OutlineInputBorder(),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter a reason';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _notesController,
            decoration: const InputDecoration(
              labelText: 'Additional Notes (Optional)',
              hintText: 'Any specific concerns or information',
              border: OutlineInputBorder(),
            ),
            maxLines: 3,
          ),
        ],
      ),
    );
  }

  Future<void> _submitBooking() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final selectedDate = ref.read(selectedDateProvider);
    final selectedDoctor = ref.read(selectedDoctorProvider);

    if (selectedDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a date')),
      );
      return;
    }

    if (selectedDoctor == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a doctor')),
      );
      return;
    }

    try {
      final apiService = ApiService();
      final result = await apiService.bookAppointment(
        appointmentDate: selectedDate,
        doctorId: selectedDoctor['id'],
        typeId: 'consultation',
        reason: _reasonController.text,
        notes: _notesController.text.isNotEmpty ? _notesController.text : null,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Appointment booked successfully!')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to book appointment: $e')),
        );
      }
    }
  }
}