package com.batanasov.medical_record_app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class VisitsByPatientResult {
    private String patientId;
    private List<String> visitIds;
}