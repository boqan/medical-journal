package com.batanasov.medical_record_app.controller;

import com.batanasov.medical_record_app.dto.AuthRegisterRequest;
import com.batanasov.medical_record_app.dto.DoctorDTO;
import com.batanasov.medical_record_app.dto.PatientDTO;
import com.batanasov.medical_record_app.service.DoctorService;
import com.batanasov.medical_record_app.service.KeycloakAdminClientService;
import com.batanasov.medical_record_app.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final KeycloakAdminClientService keycloakService;
    private final DoctorService doctorService;
    private final PatientService patientService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody AuthRegisterRequest req) {
        try {
            // 1) create user in Keycloak
            String userId = keycloakService.createUser(req.getUsername(), req.getPassword(), req.getRole());

            // 2) create local entity if role=doctor or patient
            if (req.getRole().equalsIgnoreCase("doctor")) {
                DoctorDTO docDto = new DoctorDTO();
                docDto.setKeycloakUserId(userId);
                docDto.setName(req.getName());
                docDto.setSpecialties(req.getSpecialties());
                doctorService.createDoctor(docDto);

            } else if (req.getRole().equalsIgnoreCase("patient")) {
                PatientDTO patDto = new PatientDTO();
                patDto.setKeycloakUserId(userId);
                patDto.setName(req.getName());
                patDto.setEgn(req.getEgn());

                // set the personalDoctorId
                patDto.setPersonalDoctorId(req.getPersonalDoctorId());

                // personalDoctorId or lastInsurancePaidDate can come from req if desired
                patientService.createPatient(patDto);
            }

            // If role=admin or something else, we might not create a local entity
            return ResponseEntity.ok("User registered successfully with role=" + req.getRole());

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

}