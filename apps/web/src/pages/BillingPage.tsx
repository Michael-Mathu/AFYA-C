import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle, Clock, AlertCircle, Receipt } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function BillingPage() {
  const queryClient = useQueryClient();

  const { data: bills, isLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: () => billingApi.list(),
  });

  const paidBills = bills?.filter((b) => b.paidAmount >= b.totalAmount) || [];
  const unpaidBills = bills?.filter((b) => b.paidAmount < b.totalAmount) || [];
  const totalOutstanding = unpaidBills.reduce(
    (sum, bill) => sum + (bill.totalAmount - bill.paidAmount),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
        <p className="text-gray-600">View and manage your bills and payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalOutstanding)}
            </div>
            <p className="text-xs text-muted-foreground">{unpaidBills.length} unpaid bills</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Bills</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidBills.length}</div>
            <p className="text-xs text-muted-foreground">Fully paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(bills?.reduce((sum, b) => sum + b.totalAmount, 0) || 0)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {unpaidBills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Unpaid Bills
            </CardTitle>
            <CardDescription>Bills requiring payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unpaidBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Bill #{bill.id.substring(0, 8)}</p>
                      <p className="text-sm text-gray-600">{formatDate(bill.createdAt)}</p>
                      <p className="text-sm text-gray-500">
                        {bill.items?.length || 0} items
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">
                      {formatCurrency(bill.totalAmount - bill.paidAmount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      of {formatCurrency(bill.totalAmount)} total
                    </p>
                    <Button size="sm" className="mt-2">
                      Pay Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>All your past and current bills</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : bills?.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No billing history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bills?.map((bill) => {
                const isPaid = bill.paidAmount >= bill.totalAmount;
                return (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          isPaid ? 'bg-green-100' : 'bg-yellow-100'
                        }`}
                      >
                        {isPaid ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Bill #{bill.id.substring(0, 8)}</p>
                        <p className="text-sm text-gray-500">{formatDate(bill.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(bill.totalAmount)}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          isPaid
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}