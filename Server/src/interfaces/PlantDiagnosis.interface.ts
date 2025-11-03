export interface PlantDiagnosis {
    diseaseName: string;
    severity: 'Low' | 'Medium' | 'High' | 'None';
    treatmentAdvice: string;
    confidenceScore: number;
}