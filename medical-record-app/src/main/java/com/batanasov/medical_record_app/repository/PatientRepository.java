package com.batanasov.medical_record_app.repository;

import com.batanasov.medical_record_app.model.Patient;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends MongoRepository<Patient, String> {

     Optional<Patient> findByEgn(String egn);

    /**
     * Finds all patients whose personalDoctorId matches the given doctorId.
     */
    List<Patient> findByPersonalDoctorId(String doctorId);


    Optional<Patient> findBykeycloakUserId(String keycloakUserId);
}