package com.batanasov.medical_record_app.service;

import com.batanasov.medical_record_app.dto.DiagnosisDTO;
import com.batanasov.medical_record_app.dto.DiagnosisListDTO;
import com.batanasov.medical_record_app.exception.ResourceNotFoundException;
import com.batanasov.medical_record_app.mapper.DtoMapper;
import com.batanasov.medical_record_app.model.Diagnosis;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.batanasov.medical_record_app.repository.DiagnosisRepository;

import java.util.List;

@Service
public class DiagnosisService {

    private final DiagnosisRepository diagnosisRepository;
    private final DtoMapper mapper;

    @Autowired
    public DiagnosisService(DiagnosisRepository diagnosisRepository, DtoMapper mapper) {
        this.diagnosisRepository = diagnosisRepository;
        this.mapper = mapper;
    }

    // CREATE
    public DiagnosisDTO createDiagnosis(DiagnosisDTO dto) {
        Diagnosis entity = mapper.toDiagnosisEntity(dto);
        Diagnosis saved = diagnosisRepository.save(entity);
        return mapper.toDiagnosisDTO(saved);
    }

    // READ all
    public List<DiagnosisListDTO> getAllDiagnoses() {
        List<Diagnosis> list = diagnosisRepository.findAll();
        return mapper.toDiagnosisListDTOList(list);
    }

    // READ by ID
    public DiagnosisDTO getDiagnosisById(String id) {
        Diagnosis diag = diagnosisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Diagnosis with ID " + id + " not found"));
        return mapper.toDiagnosisDTO(diag);
    }

    // UPDATE
    public DiagnosisDTO updateDiagnosis(String id, DiagnosisDTO dto) {
        Diagnosis existing = diagnosisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Diagnosis with ID " + id + " not found"));

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        Diagnosis updated = diagnosisRepository.save(existing);
        return mapper.toDiagnosisDTO(updated);
    }

    // DELETE
    public boolean deleteDiagnosis(String id) {
        if (!diagnosisRepository.existsById(id)) {
            throw new ResourceNotFoundException("Diagnosis with ID " + id + " not found");
        }
        diagnosisRepository.deleteById(id);
        return true;
    }
}