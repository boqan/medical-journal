package com.batanasov.medical_record_app.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientDTO {
    // no id for mapstruct null id issue
    private String keycloakUserId;
    private String name;
    private String egn;
    private LocalDate lastInsurancePaidDate;
    private String personalDoctorId; // references a Doctor's ID
}