package com.batanasov.medical_record_app.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.util.List;

@Data
@Document(collection = "doctors")
public class Doctor {

    @Id
    private String id;

    // The Keycloak user that corresponds to this doctor
    private String keycloakUserId;

    @NotBlank(message = "Doctor name cannot be blank")
    @Size(max = 100, message = "Doctor name must be at most 100 characters")
    private String name;

    @NotEmpty(message = "Doctor must have at least one specialty")
    private List<@NotBlank(message = "Specialty cannot be blank") String> specialties;

}