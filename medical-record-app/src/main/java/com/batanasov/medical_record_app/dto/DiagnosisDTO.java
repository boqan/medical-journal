package com.batanasov.medical_record_app.dto;

import lombok.Data;

@Data
public class DiagnosisDTO {
    // no id for mapstruct null id issue
    private String name;
    private String description;
}
