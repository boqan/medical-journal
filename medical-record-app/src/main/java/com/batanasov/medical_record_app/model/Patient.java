package com.batanasov.medical_record_app.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Data
@Document(collection = "patients")
public class Patient {

    @Id
    private String id;

    // The Keycloak user that corresponds to this patient
    private String keycloakUserId;

    @NotBlank(message = "Patient name cannot be blank")
    @Size(max = 100, message = "Patient name must be at most 100 characters")
    private String name;

    @NotBlank(message = "EGN cannot be blank")
    @Size(min = 10, max = 10, message = "EGN must be exactly 10 characters")
    private String egn;

    // optional, can be null if not paid
    private LocalDate lastInsurancePaidDate;

    // must reference a valid doctor
    @NotBlank(message = "personalDoctorId is required")
    private String personalDoctorId;

    // getters, setters, etc.
}