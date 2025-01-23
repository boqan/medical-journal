package com.batanasov.medical_record_app.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Data
@Document(collection = "visits")
public class Visit {

    @Id
    private String id;

    @NotBlank(message = "PatientId is required")
    private String patientId;

    @NotBlank(message = "DoctorId is required")
    private String doctorId;

    @NotNull(message = "Visit date cannot be null")
    private LocalDate visitDate;

    private List<String> diagnosisIds;

    private List<String> prescribedMedications;

    private SickLeave sickLeave;

}