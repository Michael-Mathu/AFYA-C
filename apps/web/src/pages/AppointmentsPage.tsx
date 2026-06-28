import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentApi } from '@/lib/api';
import { useAuth } from '@/App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, MapPin, Plus, X, Loader2, CheckCircle } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showBooking, setShowBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    doctorId: '',
    typeId: '',
    appointmentDate: '',
    reason: '',
    notes: '',
  });

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentApi.list(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => appointmentApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const upcomingAppointments = appointments?.data?.filter(
    (a) => a.status === 'SCHEDULED' && new Date(a.appointmentDate) > new Date()
  ) || [];

  const pastAppointments = appointments?.data?.filter(
    (a) => a.status !== 'SCHEDULED' || new Date(a.appointmentDate) <= new Date()
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage your upcoming and past appointments</p>
        </div>
        <Button onClick={() => setShowBooking(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Book Appointment
        </Button>
      </div>

      {showBooking && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Book New Appointment</CardTitle>
                <CardDescription>Select a doctor and preferred time</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowBooking(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={bookingForm.appointmentDate}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, appointmentDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Visit
                  </label>
                  <Input
                    value={bookingForm.reason}
                    onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                    placeholder="e.g., Annual checkup"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={3}
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  placeholder="Any specific concerns or information..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowBooking(false)}>
                  Cancel
                </Button>
                <Button type="submit">Confirm Booking</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>Your scheduled appointments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming appointments</p>
              <Button className="mt-4" onClick={() => setShowBooking(true)}>
                Book Your First Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{appointment.type.name}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(appointment.appointmentDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(appointment.appointmentDate).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(appointment.type.price)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelMutation.mutate(appointment.id)}
                      disabled={cancelMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past Appointments</CardTitle>
          <CardDescription>Your appointment history</CardDescription>
        </CardHeader>
        <CardContent>
          {pastAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No past appointments</p>
          ) : (
            <div className="space-y-3">
              {pastAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{appointment.type.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{formatDate(appointment.appointmentDate)}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        appointment.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : appointment.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}