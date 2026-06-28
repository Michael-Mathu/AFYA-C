import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/api_service.dart';

final profileProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  return null;
});

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: CircleAvatar(
                radius: 50,
                backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                child: Text(
                  '${user?['firstName']?[0] ?? ''}${user?['lastName']?[0] ?? ''}',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onPrimaryContainer,
                      ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Center(
              child: Text(
                '${user?['firstName'] ?? ''} ${user?['lastName'] ?? ''}',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ),
            if (user?['mrn'] != null)
              Center(
                child: Text(
                  'MRN: ${user!['mrn']}',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                ),
              ),
            const SizedBox(height: 24),
            _buildSection(
              context,
              title: 'Personal Information',
              children: [
                _buildInfoTile(
                  context,
                  icon: Icons.email,
                  title: 'Email',
                  subtitle: user?['email'] ?? 'Not provided',
                ),
                _buildInfoTile(
                  context,
                  icon: Icons.phone,
                  title: 'Phone',
                  subtitle: user?['phone'] ?? 'Not provided',
                ),
                _buildInfoTile(
                  context,
                  icon: Icons.location_on,
                  title: 'Address',
                  subtitle: user?['address'] ?? 'Not provided',
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildSection(
              context,
              title: 'Emergency Contact',
              children: [
                if (user?['emergencyContact'] != null) ...[
                  _buildInfoTile(
                    context,
                    icon: Icons.person,
                    title: 'Name',
                    subtitle: user!['emergencyContact']['name'] ?? 'Not provided',
                  ),
                  _buildInfoTile(
                    context,
                    icon: Icons.phone,
                    title: 'Phone',
                    subtitle: user['emergencyContact']['phone'] ?? 'Not provided',
                  ),
                ] else
                  const Padding(
                    padding: EdgeInsets.all(16),
                    child: Text('No emergency contact on file'),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            _buildSection(
              context,
              title: 'Insurance',
              children: [
                if (user?['insurance'] != null) ...[
                  _buildInfoTile(
                    context,
                    icon: Icons.health_and_safety,
                    title: 'Provider',
                    subtitle: user!['insurance']['provider'] ?? 'Not provided',
                  ),
                  _buildInfoTile(
                    context,
                    icon: Icons.confirmation_number,
                    title: 'Policy Number',
                    subtitle: user['insurance']['insuranceNumber'] ?? 'Not provided',
                  ),
                ] else
                  const Padding(
                    padding: EdgeInsets.all(16),
                    child: Text('No insurance information on file'),
                  ),
              ],
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {
                  // Logout logic
                },
                icon: const Icon(Icons.logout),
                label: const Text('Logout'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red,
                  side: const BorderSide(color: Colors.red),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(
    BuildContext context, {
    required String title,
    required List<Widget> children,
  }) {
    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              title,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ),
          const Divider(height: 1),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInfoTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return ListTile(
      leading: Icon(icon, color: Theme.of(context).colorScheme.primary),
      title: Text(title),
      subtitle: Text(subtitle),
    );
  }
}