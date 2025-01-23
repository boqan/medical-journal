package com.batanasov.medical_record_app.controller;

import com.batanasov.medical_record_app.dto.VisitDTO;
import com.batanasov.medical_record_app.dto.VisitListDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.batanasov.medical_record_app.service.VisitService;

import java.util.List;

@RestController
@RequestMapping("/api/visits")
public class VisitController {

    private final VisitService visitService;

    @Autowired
    public VisitController(VisitService visitService) {
        this.visitService = visitService;
    }

    // CREATE
    @PostMapping
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public VisitDTO createVisit(@RequestBody VisitDTO visitDTO) {
        return visitService.createVisit(visitDTO);
    }

    // READ all
    @GetMapping
    @PreAuthorize("hasRole('doctor') or hasRole('admin') or hasRole('patient')")
    public List<VisitListDTO> getAllVisits() {
        return visitService.getAllVisits();
    }

    // READ by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('doctor') or hasRole('admin') or hasRole('patient')")
    public VisitDTO getVisitById(@PathVariable String id) {
        return visitService.getVisitById(id);
    }


    // UPDATE
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public VisitDTO updateVisit(@PathVariable String id, @RequestBody VisitDTO visitDTO) {
        return visitService.updateVisit(id, visitDTO);
    }

    // DELETE
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public boolean deleteVisit(@PathVariable String id) {
        return visitService.deleteVisit(id);
    }

    // get visits by patient
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('doctor') or hasRole('admin') or hasRole('patient')")
    public List<VisitDTO> getVisitsByPatient(@PathVariable String patientId) {
        return visitService.getVisitsByPatient(patientId);
    }

    // get visits by doctor
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public List<VisitDTO> getVisitsByDoctor(@PathVariable String doctorId) {
        return visitService.getVisitsByDoctor(doctorId);
    }
}