package com.batanasov.medical_record_app.repository;

import com.batanasov.medical_record_app.model.Diagnosis;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiagnosisRepository extends MongoRepository<Diagnosis, String> {

     List<Diagnosis> findByNameContainingIgnoreCase(String partialName);
}