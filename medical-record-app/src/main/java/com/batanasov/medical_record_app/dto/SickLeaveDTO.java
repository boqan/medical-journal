package com.batanasov.medical_record_app.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class SickLeaveDTO {
    private LocalDate startDate;
    private int numberOfDays;
}
