package com.batanasov.medical_record_app.dto;

import lombok.Data;

import java.util.List;

@Data
public class DoctorListDTO {
    private String id; // the Mongo @Id
    private String keycloakUserId;
    private String name;
    private List<String> specialties;
}