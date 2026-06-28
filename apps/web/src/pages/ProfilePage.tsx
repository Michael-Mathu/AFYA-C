import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone, MapPin, Shield, Heart, AlertTriangle, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    email: '',
  });

  const { data: patientResp, isLoading } = useQuery({
    queryKey: ['patient-profile'],
    queryFn: () => patientApi.getProfile(),
  });

  const patient = patientResp?.data;

  // Populate form when data loads
  useEffect(() => {
    if (patient && !isEditing) {
      setFormData({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        phone: patient.phone || '',
        address: patient.address || '',
        email: patient.email || '',
      });
    }
  }, [patient, isEditing]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => patientApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-profile'] });
      setIsEditing(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your basic profile details</CardDescription>
                </div>
                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">
                        {patient?.firstName} {patient?.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{patient?.email || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{patient?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{patient?.address || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
              <CardDescription>Your insurance coverage details</CardDescription>
            </CardHeader>
            <CardContent>
              {patient?.insurance ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Provider</p>
                      <p className="font-medium">{patient.insurance.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Policy Number</p>
                      <p className="font-medium">{patient.insurance.insuranceNumber || patient.insurance.policyNumber}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No insurance information on file</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Heart className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Blood Type</p>
                  <p className="font-medium">{patient?.bloodType || 'Not recorded'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">MRN</p>
                  <p className="font-medium font-mono">{patient?.mrn}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Allergies</CardTitle>
            </CardHeader>
            <CardContent>
              {patient?.allergies?.length ? (
                <div className="space-y-2">
                  {patient.allergies.map((allergy: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="font-medium text-sm">{allergy.allergen}</p>
                        <p className="text-xs text-gray-500">{allergy.severity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No allergies recorded</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              {patient?.emergencyContact ? (
                <div className="space-y-2">
                  <p className="font-medium">{patient.emergencyContact.name}</p>
                  <p className="text-sm text-gray-600">
                    {patient.emergencyContact.relationship}
                  </p>
                  <p className="text-sm text-gray-600">{patient.emergencyContact.phone}</p>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No emergency contact on file</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}