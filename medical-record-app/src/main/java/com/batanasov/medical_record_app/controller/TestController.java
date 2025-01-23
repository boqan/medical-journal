package com.batanasov.medical_record_app.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping
    public ResponseEntity<String> defaultResponse() {
        return ResponseEntity.ok("This works");
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('doctor') or hasRole('admin')")
    public ResponseEntity<String> doctorResponse() {
        return ResponseEntity.ok("Hello Doctor");
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<String> adminResponse() {
        return ResponseEntity.ok("Hello Admin");
    }

    @GetMapping("/patient")
    @PreAuthorize("hasRole('patient') or hasRole('doctor') or hasRole('admin')")
    public ResponseEntity<String> patientResponse() {
        return ResponseEntity.ok("Hello Patient");
    }

}