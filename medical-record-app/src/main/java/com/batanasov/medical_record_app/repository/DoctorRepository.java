package com.batanasov.medical_record_app.repository;

import com.batanasov.medical_record_app.model.Doctor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends MongoRepository<Doctor, String> {

     List<Doctor> findByName(String name);
     List<Doctor> findBySpecialtiesContaining(String specialty);
}