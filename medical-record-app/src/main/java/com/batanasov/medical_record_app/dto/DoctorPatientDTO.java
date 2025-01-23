package com.batanasov.medical_record_app.dto;

import lombok.Data;

import java.util.List;

@Data
public class DoctorPatientDTO {
    private String doctorId;
    private String name;
    private List<String> specialties;
}