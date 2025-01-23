package com.batanasov.medical_record_app.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DoctorVisitCount {
    private String doctorId;
    private long visitCount;
}