package com.batanasov.medical_record_app.controller;

import com.batanasov.medical_record_app.dto.DiagnosisDTO;
import com.batanasov.medical_record_app.dto.DiagnosisListDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.batanasov.medical_record_app.service.DiagnosisService;

import java.util.List;

@RestController
@RequestMapping("/api/diagnoses")
public class DiagnosisController {

    private final DiagnosisService diagnosisService;

    @Autowired
    public DiagnosisController(DiagnosisService diagnosisService) {
        this.diagnosisService = diagnosisService;
    }

    // CREATE
    @PostMapping
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public DiagnosisDTO createDiagnosis(@RequestBody DiagnosisDTO diagnosisDTO) {
        return diagnosisService.createDiagnosis(diagnosisDTO);
    }

    // READ all
    @GetMapping
    @PreAuthorize("hasRole('doctor') or hasRole('admin') or hasRole('patient')")
    public List<DiagnosisListDTO> getAllDiagnoses() {
        return diagnosisService.getAllDiagnoses();
    }

    // READ by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public DiagnosisDTO getDiagnosisById(@PathVariable String id) {
        return diagnosisService.getDiagnosisById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public DiagnosisDTO updateDiagnosis(@PathVariable String id, @RequestBody DiagnosisDTO diagnosisDTO) {
        return diagnosisService.updateDiagnosis(id, diagnosisDTO);
    }

    // DELETE
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public boolean deleteDiagnosis(@PathVariable String id) {
        return diagnosisService.deleteDiagnosis(id);
    }
}