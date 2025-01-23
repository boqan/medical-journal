package com.batanasov.medical_record_app.service;


import com.batanasov.medical_record_app.dto.PatientDTO;
import com.batanasov.medical_record_app.dto.PatientIdDTO;
import com.batanasov.medical_record_app.dto.PatientListDTO;
import com.batanasov.medical_record_app.exception.ResourceNotFoundException;
import com.batanasov.medical_record_app.mapper.DtoMapper;
import com.batanasov.medical_record_app.model.Patient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.batanasov.medical_record_app.repository.DoctorRepository;
import com.batanasov.medical_record_app.repository.PatientRepository;

import java.time.LocalDate;
import java.util.List;


@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DtoMapper mapper;

    @Autowired
    public PatientService(PatientRepository patientRepository,
                          DoctorRepository doctorRepository,
                          DtoMapper mapper) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.mapper = mapper;
    }

    // CREATE
    public PatientDTO createPatient(PatientDTO dto) {
        // personalDoctorId is required; check existence
        if (!doctorRepository.existsById(dto.getPersonalDoctorId())) {
            throw new ResourceNotFoundException("Doctor with ID " + dto.getPersonalDoctorId() + " not found");
        }
        Patient entity = mapper.toPatientEntity(dto);

        Patient saved = patientRepository.save(entity);
        return mapper.toPatientDTO(saved);
    }

    // READ all
    public List<PatientListDTO> getAllPatients() {
        List<Patient> list = patientRepository.findAll();
        return mapper.toPatientListDTOList(list);
    }

    // READ by ID
    public PatientDTO getPatientById(String id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient with ID " + id + " not found"));
        return mapper.toPatientDTO(patient);
    }

    //get id by keycloak id
    public PatientIdDTO getPatientByKeycloakId(String keycloakUserId) {
        Patient patient = patientRepository.findBykeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient with Keycloak ID " + keycloakUserId + " not found"));
        return mapper.toPatientIdDTO(patient);
    }

    // UPDATE
    public PatientDTO updatePatient(String id, PatientDTO dto) {
        Patient existing = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient with ID " + id + " not found"));

        // Check new personalDoctorId
        if (!doctorRepository.existsById(dto.getPersonalDoctorId())) {
            throw new ResourceNotFoundException("Doctor with ID " + dto.getPersonalDoctorId() + " not found");
        }

        existing.setName(dto.getName());
        existing.setEgn(dto.getEgn());
        existing.setLastInsurancePaidDate(dto.getLastInsurancePaidDate());
        existing.setPersonalDoctorId(dto.getPersonalDoctorId());

        Patient updated = patientRepository.save(existing);
        return mapper.toPatientDTO(updated);
    }

    // DELETE
    public boolean deletePatient(String id) {
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient with ID " + id + " not found");
        }
        patientRepository.deleteById(id);
        return true;
    }

    // Check if insured in last 6 months
    public boolean isInsuredInLastSixMonths(String patientId) {
        Patient p = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient with ID " + patientId + " not found"));

        LocalDate lastPay = p.getLastInsurancePaidDate();
        if (lastPay == null) return false;

        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        return !lastPay.isBefore(sixMonthsAgo);
    }

}