package com.batanasov.medical_record_app.dto;

import lombok.Data;

@Data
public class PatientListDTO {
    private String id;
    private String name;
    private String egn;
    private String personalDoctorId;
}