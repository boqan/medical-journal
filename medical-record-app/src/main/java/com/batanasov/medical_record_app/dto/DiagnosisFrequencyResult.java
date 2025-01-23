package com.batanasov.medical_record_app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DiagnosisFrequencyResult {
    private String diagnosisId;
    private long count;
}
