package com.batanasov.medical_record_app.dto;

import lombok.Data;

import java.util.List;

@Data
public class DoctorDTO {
    // no id for mapstruct null id issue
    private String keycloakUserId;
    private String name;
    private List<String> specialties;
}