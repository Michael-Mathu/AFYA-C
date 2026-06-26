import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../models/api_service.dart';

final billingProvider = StateProvider<List<Map<String, dynamic>>>((ref) => []);
final selectedBillProvider = StateProvider<Map<String, dynamic>?>((ref) => null);
final isLoadingBillingProvider = StateProvider<bool>((ref) => false);
final paymentPhoneProvider = StateProvider<String>((ref) => '');
final paymentAmountProvider = StateProvider<double>((ref) => 0.0);

class BillingScreen extends ConsumerStatefulWidget {
  const BillingScreen({super.key});

  @override
  ConsumerState<BillingScreen> createState() => _BillingScreenState();
}

class _BillingScreenState extends ConsumerState<BillingScreen> {
  @override
  void initState() {
    super.initState();
    _loadBills();
  }

  @override
  Widget build(BuildContext context) {
    final bills = ref.watch(billingProvider);
    final isLoading = ref.watch(isLoadingBillingProvider);

    final totalPaid = bills.fold<double>(
      0.0,
      (sum, bill) => sum + ((bill['paidAmount'] as num?)?.toDouble() ?? 0.0),
    );
    final totalBalance = bills.fold<double>(
      0.0,
      (sum, bill) => sum + ((bill['balance'] as num?)?.toDouble() ?? 0.0),
    );

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: const Text('Billing'),
      ),
      body: Column(
        children: [
          if (bills.isNotEmpty) _buildSummaryCard(context, totalPaid, totalBalance),
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : bills.isEmpty
                    ? _buildEmptyState(context)
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: bills.length,
                        itemBuilder: (context, index) {
                          final bill = bills[index];
                          return _BillCard(
                            bill: bill,
                            onTap: () => _showBillDetail(context, bill),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(BuildContext context, double totalPaid, double totalBalance) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Theme.of(context).colorScheme.primaryContainer,
            Theme.of(context).colorScheme.secondaryContainer,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          Column(
            children: [
              const Text('Total Paid', style: TextStyle(fontSize: 12)),
              const SizedBox(height: 4),
              Text(
                'KES ${NumberFormat('#,##0').format(totalPaid)}',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          Container(
            width: 1,
            height: 40,
            color: Theme.of(context).dividerColor,
          ),
          Column(
            children: [
              Text(
                'Balance',
                style: TextStyle(
                  fontSize: 12,
                  color: totalBalance > 0
                      ? Theme.of(context).colorScheme.error
                      : Theme.of(context).colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'KES ${NumberFormat('#,##0').format(totalBalance)}',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: totalBalance > 0
                      ? Theme.of(context).colorScheme.error
                      : null,
                ),
              ),
            ],
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
            Icons.receipt_long_outlined,
            size: 64,
            color: Theme.of(context).colorScheme.outline,
          ),
          const SizedBox(height: 16),
          Text(
            'No billing history',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Your invoices will appear here after visits',
            style: Theme.of(context).textTheme.bodyMedium,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Future<void> _loadBills() async {
    ref.read(isLoadingBillingProvider.notifier).state = true;
    try {
      final apiService = ApiService();
      final data = await apiService.getBills();
      if (mounted) {
        ref.read(billingProvider.notifier).state = List.from(data);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load bills: $e')),
        );
      }
    } finally {
      if (mounted) {
        ref.read(isLoadingBillingProvider.notifier).state = false;
      }
    }
  }

  void _showBillDetail(BuildContext context, Map<String, dynamic> bill) {
    ref.read(selectedBillProvider.notifier).state = bill;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.6,
          maxChildSize: 0.9,
          expand: false,
          builder: (context, scrollController) {
            final items = bill['items'] as List<dynamic>? ?? [];
            final balance = bill['balance'] as num? ?? 0;

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
                              bill['billNumber'] ?? 'N/A',
                              style: const TextStyle(fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              DateFormat('MMMM dd, yyyy').format(
                                DateTime.parse(bill['billDate']),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Chip(
                        label: Text(bill['status'] ?? 'Unknown'),
                        backgroundColor: (bill['status'] == 'PAID' ? Colors.green : Colors.orange)
                            .withOpacity(0.2),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Line Items',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 12),
                  ...items.map((item) {
                    final i = item as Map<String, dynamic>;
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(child: Text(i['itemName'] ?? 'Unknown')),
                          Text(
                            'KES ${NumberFormat('#,##0').format(i['totalPrice'] ?? 0)}',
                            style: const TextStyle(fontWeight: FontWeight.w500),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total', style: TextStyle(fontWeight: FontWeight.bold)),
                      Text(
                        'KES ${NumberFormat('#,##0').format(bill['totalAmount'] ?? 0)}',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Paid', style: TextStyle(color: Colors.green)),
                      Text(
                        'KES ${NumberFormat('#,##0').format(bill['paidAmount'] ?? 0)}',
                        style: const TextStyle(color: Colors.green),
                      ),
                    ],
                  ),
                  if (balance > 0) ...[
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Balance', style: TextStyle(color: Colors.red)),
                        Text(
                          'KES ${NumberFormat('#,##0').format(balance)}',
                          style: const TextStyle(color: Colors.red),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 24),
                  if (balance > 0)
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          _showMPesaPaymentDialog(context, bill, balance.toDouble());
                        },
                        icon: const Icon(Icons.payment),
                        label: const Text('Pay with M-Pesa'),
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

  void _showMPesaPaymentDialog(BuildContext context, Map<String, dynamic> bill, double amount) {
    final phoneController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('M-Pesa Payment'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'KES ${NumberFormat('#,##0').format(amount)}',
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: phoneController,
                decoration: const InputDecoration(
                  labelText: 'M-Pesa Phone Number',
                  prefixIcon: Icon(Icons.phone),
                  hintText: '254712345678',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.phone,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () => _processPayment(context, bill, amount, phoneController.text),
              child: const Text('Pay Now'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _processPayment(
      BuildContext context,
      Map<String, dynamic> bill,
      double amount,
      String phoneNumber) async {
    if (phoneNumber.isEmpty || phoneNumber.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid phone number')),
      );
      return;
    }

    ref.read(isLoadingBillingProvider.notifier).state = true;
    Navigator.pop(context);

    try {
      final apiService = ApiService();
      final response = await apiService.initiateMPesaPayment(
        billId: bill['id'],
        amount: amount,
        phoneNumber: phoneNumber,
      );

      if (response != null && response['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Check your phone for STK Push')),
          );
        }
      } else {
        throw Exception(response['error']?['message'] ?? 'Payment failed');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Payment failed: $e')),
        );
      }
    } finally {
      if (mounted) {
        ref.read(isLoadingBillingProvider.notifier).state = false;
      }
    }
  }
}

class _BillCard extends StatelessWidget {
  final Map<String, dynamic> bill;
  final VoidCallback onTap;
  const _BillCard({required this.bill, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final status = bill['status'] as String? ?? 'Unknown';
    final balance = bill['balance'] as num? ?? 0;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: status == 'PAID'
              ? Colors.green.withOpacity(0.2)
              : Colors.orange.withOpacity(0.2),
          child: Icon(
            status == 'PAID' ? Icons.check_circle : Icons.pending,
            color: status == 'PAID' ? Colors.green : Colors.orange,
          ),
        ),
        title: Text(
          bill['billNumber'] ?? 'N/A',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              DateFormat('MMMM dd, yyyy').format(DateTime.parse(bill['billDate'])),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Text(
                  'KES ${NumberFormat('#,##0').format(bill['totalAmount'] ?? 0)}',
                  style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
                ),
                if (balance > 0) ...[
                  const SizedBox(width: 8),
                  Text(
                    '• Balance: KES ${NumberFormat('#,##0').format(balance)}',
                    style: TextStyle(color: Theme.of(context).colorScheme.error),
                  ),
                ],
              ],
            ),
          ],
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }
}
