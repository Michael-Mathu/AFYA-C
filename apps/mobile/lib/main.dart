import 'package:flutter/material.dart';
import 'models/api_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: AFYAMobileApp()));
}

class AFYAMobileApp extends StatelessWidget {
  const AFYAMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'AFYA-C Mobile',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.teal,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      routerConfig: GoRouter(
        initialLocation: '/',
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const LoginScreen(),
          ),
          GoRoute(
            path: '/home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/appointments',
            builder: (context, state) => const AppointmentsScreen(),
          ),
          GoRoute(
            path: '/records',
            builder: (context, state) => const MedicalRecordsScreen(),
          ),
          GoRoute(
            path: '/messaging',
            builder: (context, state) => const MessagingScreen(),
          ),
          GoRoute(
            path: '/prescriptions',
            builder: (context, state) => const PrescriptionsScreen(),
          ),
          GoRoute(
            path: '/lab-results',
            builder: (context, state) => const LabResultsScreen(),
          ),
          GoRoute(
            path: '/billing',
            builder: (context, state) => const BillingScreen(),
          ),
        ],
      ),
      debugShowCheckedModeBanner: false,
    );
  }
}

// Placeholder screens - would be implemented in separate files
class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(child: Text('Login Screen', style: TextStyle(fontSize: 24))),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AFYA-C Mobile')),
      body: const Center(child: Text('Home Screen')),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 0,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: 'Appointments'),
          BottomNavigationBarItem(icon: Icon(Icons.message), label: 'Messages'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

class AppointmentsScreen extends StatelessWidget {
  const AppointmentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(appBar: AppBar(title: const Text('Appointments')));
  }
}

class MedicalRecordsScreen extends StatelessWidget {
  const MedicalRecordsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(appBar: AppBar(title: const Text('Medical Records')));
  }
}

class MessagingScreen extends StatelessWidget {
  const MessagingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(appBar: AppBar(title: const Text('Messages')));
  }
}

class PrescriptionsScreen extends StatelessWidget {
  const PrescriptionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(appBar: AppBar(title: const Text('Prescriptions')));
  }
}

class LabResultsScreen extends StatelessWidget {
  const LabResultsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(appBar: AppBar(title: const Text('Lab Results')));
  }
}

class BillingScreen extends StatelessWidget {
  const BillingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(appBar: AppBar(title: const Text('Billing')));
  }
}