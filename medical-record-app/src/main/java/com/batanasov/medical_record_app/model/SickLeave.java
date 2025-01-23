package com.batanasov.medical_record_app.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SickLeave {

    @NotNull(message = "Sick leave start date is required")
    private LocalDate startDate;

    @Min(value = 1, message = "Number of days must be at least 1")
    private int numberOfDays;

}