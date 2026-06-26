// MRN Generator utility
export async function generateMRN(patientsRepository: any): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'MRN';
  
  // Get the latest MRN for this year
  const latestPatient = await patientsRepository
    .createQueryBuilder('patient')
    .where('patient.mrn LIKE :pattern', { pattern: `${prefix}-${year}%` })
    .orderBy('patient.mrn', 'DESC')
    .getOne();
  
  let sequence = 1;
  if (latestPatient) {
    const match = latestPatient.mrn.match(/MRN-(\d{4})-(\d+)/);
    if (match) {
      sequence = parseInt(match[2]) + 1;
    }
  }
  
  return `${prefix}-${year}-${sequence.toString().padStart(6, '0')}`;
}
