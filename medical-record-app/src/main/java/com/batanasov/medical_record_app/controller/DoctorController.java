package com.batanasov.medical_record_app.controller;

import com.batanasov.medical_record_app.dto.DoctorDTO;
import com.batanasov.medical_record_app.dto.DoctorListDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.batanasov.medical_record_app.service.DoctorService;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    @Autowired
    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    // CREATE
    @PostMapping
    @PreAuthorize("hasRole('admin')")
    public DoctorDTO createDoctor(@RequestBody DoctorDTO doctorDTO) {
        return doctorService.createDoctor(doctorDTO);
    }

    // READ all
    @GetMapping("/all")
    public List<DoctorListDTO> getAllDoctors() {
        return doctorService.getAllDoctors();
    }

    // READ by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('admin') or hasRole('patient') or hasRole('doctor')")
    public DoctorDTO getDoctorById(@PathVariable String id) {
        return doctorService.getDoctorById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public DoctorDTO updateDoctor(@PathVariable String id, @RequestBody DoctorDTO doctorDTO) {
        return doctorService.updateDoctor(id, doctorDTO);
    }

    // DELETE
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public boolean deleteDoctor(@PathVariable String id) {
        return doctorService.deleteDoctor(id);
    }
}