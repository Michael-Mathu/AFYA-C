import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { medicalRecordApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Search, Clock, Pill, Beaker, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function MedicalRecordsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const { data: records, isLoading } = useQuery({
    queryKey: ['medical-records'],
    queryFn: () => medicalRecordApi.list(),
  });

  const filteredRecords = records?.data?.filter(
    (record) =>
      record.assessment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
        <p className="text-gray-600">View your consultation history and medical information</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-semibold text-gray-900">Consultation History</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No medical records found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedRecord?.id === record.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        Dr. {record.doctor.firstName} {record.doctor.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(record.consultationDate)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                  {record.assessment && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{record.assessment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedRecord ? (
            <Card>
              <CardHeader>
                <CardTitle>Consultation Details</CardTitle>
                <CardDescription>
                  {formatDate(selectedRecord.consultationDate)} with Dr.{' '}
                  {selectedRecord.doctor.firstName} {selectedRecord.doctor.lastName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">Subjective</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {selectedRecord.subjective || 'No notes recorded'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">Objective</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {selectedRecord.objective || 'No notes recorded'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">Assessment</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {selectedRecord.assessment || 'No assessment recorded'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">Plan</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {selectedRecord.plan || 'No plan recorded'}
                    </p>
                  </div>
                </div>

                {selectedRecord.diagnoses?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Diagnoses
                    </h3>
                    <div className="space-y-2">
                      {selectedRecord.diagnoses.map((diag: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {diag.icdCode}
                          </span>
                          <span>{diag.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRecord.prescriptions?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      Prescriptions
                    </h3>
                    <div className="space-y-2">
                      {selectedRecord.prescriptions.map((presc: any, idx: number) => (
                        <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                          <p className="font-medium">{presc.medicationName}</p>
                          <p className="text-gray-600">
                            {presc.dosage} - {presc.frequency} for {presc.durationDays} days
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRecord.labRequests?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                      <Beaker className="h-4 w-4" />
                      Lab Requests
                    </h3>
                    <div className="space-y-2">
                      {selectedRecord.labRequests.map((lab: any, idx: number) => (
                        <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                          <p className="font-medium">{lab.testName || 'Lab Test'}</p>
                          <p className="text-gray-600">
                            Status: <span className="font-medium">{lab.status}</span>
                          </p>
                          {lab.resultValue && (
                            <p className="text-gray-600">Result: {lab.resultValue}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Record</h3>
                <p className="text-gray-500">
                  Choose a consultation from the list to view its details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}