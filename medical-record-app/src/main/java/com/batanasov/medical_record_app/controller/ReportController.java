package com.batanasov.medical_record_app.controller;

import com.batanasov.medical_record_app.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.batanasov.medical_record_app.service.ReportService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    @Autowired
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // (3a) GET /api/reports/patients-by-diagnosis/{diagId}
    @GetMapping("/patients-by-diagnosis/{diagnosisId}")
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public List<PatientDTO> getPatientsByDiagnosis(@PathVariable String diagnosisId) {
        return reportService.getPatientsByDiagnosis(diagnosisId);
    }

    // (3b) GET /api/reports/top-diagnoses?top=3
    @GetMapping("/top-diagnoses")
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public List<DiagnosisFrequencyResult> getTopDiagnoses(@RequestParam(defaultValue="3") int top) {
        return reportService.getMostFrequentDiagnoses(top);
    }

    // (3c) GET /api/reports/patients-by-doctor/{docId}
    @GetMapping("/patients-by-doctor/{docId}")
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public List<PatientDTO> getPatientsByPersonalDoctor(@PathVariable String docId) {
        return reportService.getPatientsByPersonalDoctor(docId);
    }

    // (3d) GET /api/reports/patient-count-by-doctor
    @GetMapping("/patient-count-by-doctor")
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public List<DoctorPatientCount> getPatientCountByDoctor() {
        return reportService.getPatientCountByDoctor();
    }

    // (3e) GET /api/reports/visit-count-by-doctor
    @GetMapping("/visit-count-by-doctor")
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public List<DoctorVisitCount> getVisitCountByDoctor() {
        return reportService.getVisitCountByDoctor();
    }

    // (3f) GET /api/reports/visits-grouped-by-patient
    @GetMapping("/visits-by-patient/all")
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public List<VisitsByPatientResult> getAllVisitsGroupedByPatient() {
        return reportService.getAllVisitsGroupedByPatient();
    }

    // (3g) GET /api/reports/visits-date-range?start=...&end=...
    @GetMapping("/visits-date-range")
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public List<VisitDTO> getVisitsDateRange(@RequestParam LocalDate start,
                                             @RequestParam LocalDate end) {
        return reportService.getVisitsInDateRange(start, end);
    }

    // (3h) GET /api/reports/visits-by-doctor-date-range?doctorId=...&start=...&end=...
    @GetMapping("/visits-by-doctor-date-range")
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public List<VisitDTO> getVisitsByDoctorDateRange(@RequestParam String doctorId,
                                                     @RequestParam LocalDate start,
                                                     @RequestParam LocalDate end) {
        return reportService.getVisitsForDoctorInDateRange(doctorId, start, end);
    }

    // (3i) GET /api/reports/month-with-most-sick-leaves
    @GetMapping("/month-with-most-sick-leaves")
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public Integer getMonthWithMostSickLeaves() {
        return reportService.getMonthWithMostSickLeaves();
    }

    // (3j) GET /api/reports/top-doctors-sick-leaves?top=3
    @GetMapping("/top-doctors-sick-leaves")
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public List<DoctorSickLeaveCount> getDoctorsByMostSickLeaves(@RequestParam(defaultValue="3") int top) {
        return reportService.getDoctorsByMostSickLeaves(top);
    }
}