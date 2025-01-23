package com.batanasov.medical_record_app.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class VisitListDTO {
    private String id;
    private String patientId;           // references a Patient
    private String doctorId;            // references a Doctor
    private LocalDate visitDate;
    private List<String> diagnosisIds;  // references Diagnoses
    private List<String> prescribedMedications;
    private SickLeaveDTO sickLeave;     // embedded
}

