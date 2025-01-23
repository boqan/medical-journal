package com.batanasov.medical_record_app.dto;

import lombok.Data;

import java.util.List;

@Data
public class AuthRegisterRequest {
    private String username;
    private String password;
    private String role;         // e.g. "doctor", "patient"

    // for doctor
    private String name;
    private List<String> specialties;  // if the user is "doctor"

    // for patient
    private String egn;
    private String personalDoctorId; // <-- NEW FIELD
}