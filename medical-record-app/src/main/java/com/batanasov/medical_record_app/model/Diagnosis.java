package com.batanasov.medical_record_app.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "diagnoses")
public class Diagnosis {

    @Id
    private String id;

    @NotBlank(message = "Diagnosis name is required")
    private String name;

    // optional
    private String description;
}