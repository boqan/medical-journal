package com.batanasov.medical_record_app.dto;

import lombok.Data;

@Data
public class PatientIdDTO {
    private String id;
    private String keycloakUserId;
}