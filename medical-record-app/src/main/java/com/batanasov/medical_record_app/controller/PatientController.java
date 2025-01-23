package com.batanasov.medical_record_app.controller;

import com.batanasov.medical_record_app.dto.PatientDTO;
import com.batanasov.medical_record_app.dto.PatientIdDTO;
import com.batanasov.medical_record_app.dto.PatientListDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.batanasov.medical_record_app.service.PatientService;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    @Autowired
    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    // CREATE
    @PostMapping
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public PatientDTO createPatient(@RequestBody PatientDTO patientDTO) {
        return patientService.createPatient(patientDTO);
    }

    // READ all
    @GetMapping
    @PreAuthorize("hasRole('doctor') or hasRole('admin') or hasRole('patient')")
    public List<PatientListDTO> getAllPatients() {
        return patientService.getAllPatients();
    }

    // READ by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('doctor') or hasRole('admin') or hasRole('patient')")
    public PatientDTO getPatientById(@PathVariable String id) {
        return patientService.getPatientById(id);
    }

    @GetMapping("/keycloak/{keycloakUserId}")
    @PreAuthorize("hasRole('doctor') or hasRole('admin') or hasRole('patient')")
    public PatientIdDTO getPatientByKeycloakId(@PathVariable String keycloakUserId) {
        return patientService.getPatientByKeycloakId(keycloakUserId);
    }

    // UPDATE
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public PatientDTO updatePatient(@PathVariable String id, @RequestBody PatientDTO patientDTO) {
        return patientService.updatePatient(id, patientDTO);
    }

    // DELETE
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public boolean deletePatient(@PathVariable String id) {
        return patientService.deletePatient(id);
    }

    //special endpoint: check insurance
    @GetMapping("/{id}/isInsured")
    @PreAuthorize("hasRole('doctor') or hasRole('admin') or hasRole('patient')")
    public boolean isInsuredInLastSixMonths(@PathVariable String id) {
        return patientService.isInsuredInLastSixMonths(id);
    }
}