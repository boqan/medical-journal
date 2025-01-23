package com.batanasov.medical_record_app.service;

import com.batanasov.medical_record_app.dto.VisitDTO;
import com.batanasov.medical_record_app.dto.VisitListDTO;
import com.batanasov.medical_record_app.exception.ResourceNotFoundException;
import com.batanasov.medical_record_app.mapper.DtoMapper;
import com.batanasov.medical_record_app.model.Visit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.batanasov.medical_record_app.repository.DoctorRepository;
import com.batanasov.medical_record_app.repository.PatientRepository;
import com.batanasov.medical_record_app.repository.VisitRepository;

import java.util.List;

@Service
public class VisitService {

    private final VisitRepository visitRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DtoMapper mapper;

    @Autowired
    public VisitService(VisitRepository visitRepository,
                        DoctorRepository doctorRepository,
                        PatientRepository patientRepository,
                        DtoMapper mapper) {
        this.visitRepository = visitRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.mapper = mapper;
    }

    // CREATE
    public VisitDTO createVisit(VisitDTO dto) {
        // 1) Check doctor
        if (!doctorRepository.existsById(dto.getDoctorId())) {
            throw new ResourceNotFoundException("Doctor with ID " + dto.getDoctorId() + " not found");
        }
        // 2) Check patient
        if (!patientRepository.existsById(dto.getPatientId())) {
            throw new ResourceNotFoundException("Patient with ID " + dto.getPatientId() + " not found");
        }

        // 3) Now we are safe to map & save
        Visit entity = mapper.toVisitEntity(dto);
        Visit saved = visitRepository.save(entity);
        return mapper.toVisitDTO(saved);
    }

    // READ all
    public List<VisitListDTO> getAllVisits() {
        List<Visit> list = visitRepository.findAll();
        return mapper.toVisitListDTOList(list);
    }

    // READ by ID
    public VisitDTO getVisitById(String id) {
        return visitRepository.findById(id)
                .map(mapper::toVisitDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Visit with ID " + id + " not found"));
    }

    // UPDATE
    public VisitDTO updateVisit(String id, VisitDTO dto) {
        return visitRepository.findById(id)
                .map(existing -> {
                    // Also ensure the new doctor & patient exist
                    if (!doctorRepository.existsById(dto.getDoctorId())) {
                        throw new ResourceNotFoundException("Doctor with ID " + dto.getDoctorId() + " not found");
                    }
                    if (!patientRepository.existsById(dto.getPatientId())) {
                        throw new ResourceNotFoundException("Patient with ID " + dto.getPatientId() + " not found");
                    }

                    existing.setPatientId(dto.getPatientId());
                    existing.setDoctorId(dto.getDoctorId());
                    existing.setVisitDate(dto.getVisitDate());
                    existing.setDiagnosisIds(dto.getDiagnosisIds());
                    existing.setPrescribedMedications(dto.getPrescribedMedications());
                    existing.setSickLeave(
                            mapper.toVisitEntity(dto).getSickLeave()
                    );
                    Visit updated = visitRepository.save(existing);
                    return mapper.toVisitDTO(updated);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Visit with ID " + id + " not found"));
    }

    // DELETE
    public boolean deleteVisit(String id) {
        if (!visitRepository.existsById(id)) {
            throw new ResourceNotFoundException("Visit with ID " + id + " not found");
        }
        visitRepository.deleteById(id);
        return true;
    }

    // List all visits for a certain patient
    public List<VisitDTO> getVisitsByPatient(String patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient with ID " + patientId + " not found");
        }
        List<Visit> visits = visitRepository.findByPatientId(patientId);
        return mapper.toVisitDTOList(visits);
    }

    // List all visits for a certain doctor
    public List<VisitDTO> getVisitsByDoctor(String doctorId) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new ResourceNotFoundException("Doctor with ID " + doctorId + " not found");
        }
        List<Visit> visits = visitRepository.findByDoctorId(doctorId);
        return mapper.toVisitDTOList(visits);
    }
}
