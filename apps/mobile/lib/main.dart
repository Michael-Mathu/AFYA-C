import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'screens/appointments_screen.dart';
import 'screens/appointment_booking_screen.dart';
import 'screens/medical_records_screen.dart';
import 'screens/messaging_screen.dart';
import 'screens/prescriptions_screen.dart';
import 'screens/lab_results_screen.dart';
import 'screens/billing_screen.dart';
import 'screens/profile_screen.dart';
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
            path: '/appointments/book',
            builder: (context, state) => const AppointmentBookingScreen(),
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
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
      debugShowCheckedModeBanner: false,
    );
  }
}