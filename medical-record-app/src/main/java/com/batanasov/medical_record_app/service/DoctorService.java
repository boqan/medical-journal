package com.batanasov.medical_record_app.service;

import com.batanasov.medical_record_app.dto.DoctorDTO;
import com.batanasov.medical_record_app.dto.DoctorListDTO;
import com.batanasov.medical_record_app.exception.ResourceNotFoundException;
import com.batanasov.medical_record_app.mapper.DtoMapper;
import com.batanasov.medical_record_app.model.Doctor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.batanasov.medical_record_app.repository.DoctorRepository;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DtoMapper mapper;

    @Autowired
    public DoctorService(DoctorRepository doctorRepository, DtoMapper mapper) {
        this.doctorRepository = doctorRepository;
        this.mapper = mapper;
    }

    // CREATE
    public DoctorDTO createDoctor(DoctorDTO dto) {
        Doctor entity = mapper.toDoctorEntity(dto);

        Doctor saved = doctorRepository.save(entity);
        return mapper.toDoctorDTO(saved);
    }

    // READ all
    public List<DoctorListDTO> getAllDoctors() {
        List<Doctor> docs = doctorRepository.findAll();
        return mapper.toDoctorListDTOList(docs);
    }

    // READ by ID
    public DoctorDTO getDoctorById(String id) {
        Doctor doc = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor with ID " + id + " not found"));
        return mapper.toDoctorDTO(doc);
    }

    // UPDATE
    public DoctorDTO updateDoctor(String id, DoctorDTO dto) {
        Doctor existing = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor with ID " + id + " not found"));

        existing.setName(dto.getName());
        existing.setSpecialties(dto.getSpecialties());
        Doctor updated = doctorRepository.save(existing);
        return mapper.toDoctorDTO(updated);
    }

    // DELETE
    public boolean deleteDoctor(String id) {
        if (!doctorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Doctor with ID " + id + " not found");
        }
        doctorRepository.deleteById(id);
        return true;
    }

}