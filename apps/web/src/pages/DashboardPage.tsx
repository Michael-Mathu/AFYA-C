import { useQuery } from '@tanstack/react-query';
import { appointmentApi, medicalRecordApi, billingApi } from '@/lib/api';
import { useAuth } from '@/App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, CreditCard, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: apptResponse } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentApi.list({ limit: 5 }),
  });

  const { data: recordsResponse } = useQuery({
    queryKey: ['medical-records'],
    queryFn: () => medicalRecordApi.list(),
  });

  const { data: billsResponse } = useQuery({
    queryKey: ['bills'],
    queryFn: () => billingApi.list(),
  });

  const appointments = apptResponse?.data?.data || [];
  const records = recordsResponse?.data || [];
  const bills = billsResponse?.data || [];

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'SCHEDULED' && new Date(a.appointmentDate) > new Date()
  ) || [];

  const recentRecords = records.slice(0, 3) || [];
  const unpaidBills = bills.filter((b) => b.paidAmount < b.totalAmount) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600">Here's an overview of your health information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medical Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total consultations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unpaidBills.length}</div>
            <p className="text-xs text-muted-foreground">Outstanding bills</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled appointments</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{appointment.type.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatDate(appointment.appointmentDate)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(appointment.appointmentDate).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Consultations</CardTitle>
            <CardDescription>Your latest medical records</CardDescription>
          </CardHeader>
          <CardContent>
            {recentRecords.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent consultations</p>
            ) : (
              <div className="space-y-4">
                {recentRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          Dr. {record.doctor.firstName} {record.doctor.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {record.assessment?.substring(0, 50) || 'Consultation'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatDate(record.consultationDate)}</p>
                      <span className="inline-flex items-center gap-1 text-xs">
                        {record.status === 'SIGNED' ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-green-600">Finalized</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 text-yellow-500" />
                            <span className="text-yellow-600">Pending</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {unpaidBills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Outstanding Balance
            </CardTitle>
            <CardDescription>You have unpaid bills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unpaidBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">Bill #{bill.id.substring(0, 8)}</p>
                    <p className="text-sm text-gray-500">{formatDate(bill.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">
                      {formatCurrency(bill.totalAmount - bill.paidAmount)}
                    </p>
                    <p className="text-xs text-gray-500">Due</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}