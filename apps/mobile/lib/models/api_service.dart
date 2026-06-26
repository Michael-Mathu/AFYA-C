import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

// Core providers
final authProvider = StateProvider<bool>((ref) => false);
final userProvider = StateProvider<Map<String, dynamic>?>((ref) => null);
final appointmentsProvider = StateProvider<List<dynamic>>((ref) => []);
final medicalRecordsProvider = StateProvider<List<dynamic>>((ref) => []);

// API service
class ApiService {
  final String baseUrl = 'https://api.afya-c.com/api/v1';
  String? _token;

  void setToken(String token) {
    _token = token;
  }

  Map<String, String> get headers {
    return {
      'Content-Type': 'application/json',
      if (_token != null) 'Authorization': 'Bearer $_token',
    };
  }

  Future<Map<String, dynamic>> login(
      String email, String password, Map<String, dynamic> deviceInfo) async {
    // POST /api/auth/mobile/login
    // Implementation would use dio package
    return {};
  }

  Future<List<dynamic>> getAppointments({String? status}) async {
    // GET /api/appointments?status=$status
    return [];
  }

  Future<Map<String, dynamic>> getPatientProfile() async {
    // GET /api/patients/me
    return {};
  }

  Future<List<dynamic>> getMedicalRecords() async {
    // GET /api/consultations/patients/me
    return [];
  }

  Future<void> logout() async {
    // POST /api/auth/logout
  }
}

// Authentication feature
class AuthFeature extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    if (authState) {
      return HomeScreen();
    }

    return LoginScreen();
  }
}

class LoginScreen extends ConsumerStatefulWidget {
  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'AFYA-C Mobile',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).primaryColor,
                ),
              ),
              SizedBox(height: 48),
              TextField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: 'Email',
                  prefixIcon: Icon(Icons.email),
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                decoration: InputDecoration(
                  labelText: 'Password',
                  prefixIcon: Icon(Icons.lock),
                  border: OutlineInputBorder(),
                ),
                obscureText: true,
              ),
              SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => _handleLogin(),
                  child: Text('Login'),
                ),
              ),
              SizedBox(height: 16),
              TextButton.icon(
                onPressed: () => _handleBiometricLogin(),
                icon: Icon(Icons.fingerprint),
                label: Text('Use Biometrics'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _handleLogin() async {
    final apiService = ApiService();
    try {
      final response = await apiService.login(
        _emailController.text,
        _passwordController.text,
        {
          'deviceId': 'device-uuid',
          'deviceType': Theme.of(context).platform.toString(),
        },
      );

      if (response['success'] == true) {
        apiService.setToken(response['data']['accessToken']);
        ref.read(authProvider.notifier).state = true;
        ref.read(userProvider.notifier).state = response['data']['user'];
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Login failed: $e')),
      );
    }
  }

  void _handleBiometricLogin() async {
    // Biometric authentication implementation
    // Would use local_auth package
  }
}