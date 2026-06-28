import 'package:flutter_riverpod/flutter_riverpod.dart';

final authProvider = StateProvider<bool>((ref) => false);
final userProvider = StateProvider<Map<String, dynamic>?>((ref) => null);
final appointmentsProvider = StateProvider<List<dynamic>>((ref) => []);
final medicalRecordsProvider = StateProvider<List<dynamic>>((ref) => []);
final prescriptionsProvider = StateProvider<List<dynamic>>((ref) => []);
final labResultsProvider = StateProvider<List<dynamic>>((ref) => []);
final billingProvider = StateProvider<List<dynamic>>((ref) => []);
final conversationsProvider = StateProvider<List<dynamic>>((ref) => []);

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
    return {};
  }

  Future<List<dynamic>> getAppointments({String? status}) async {
    return [];
  }

  Future<Map<String, dynamic>> getPatientProfile() async {
    return {};
  }

  Future<List<dynamic>> getMedicalRecords() async {
    return [];
  }

  Future<Map<String, dynamic>>? bookAppointment({
    required DateTime appointmentDate,
    required String doctorId,
    required String typeId,
    required String reason,
    String? notes,
  }) async {
    try {
      final response = await http.post(
        '/appointments',
        body: {
          'appointmentDate': appointmentDate.toIso8601String(),
          'doctorId': doctorId,
          'typeId': typeId,
          'reason': reason,
          if (notes != null) 'notes': notes,
        },
        headers: headers,
      );
      
      return response.data;
    } catch (e) {
      throw Exception('Failed to book appointment: $e');
    }
  }

  Future<List<dynamic>> getConversations() async {
    return [];
  }

  Future<List<dynamic>> getMessages(Map<String, dynamic>? conversation) async {
    return [];
  }

  Future<void> sendMessage({
    required Map<String, dynamic> conversationId,
    required String content,
  }) async {}

  Future<List<dynamic>> getPrescriptions() async {
    return [];
  }

  Future<dynamic> requestRefill(String prescriptionId) {
    return Future.value(null);
  }

  Future<List<dynamic>> getLabResults() async {
    return [];
  }

  Future<List<dynamic>> getBills() async {
    return [];
  }

  Future<dynamic> initiateMPesaPayment({
    required String billId,
    required double amount,
    required String phoneNumber,
  }) {
    return Future.value(null);
  }

  Future<void> logout() async {}
}
