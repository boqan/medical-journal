package com.batanasov.medical_record_app.mapper;

import com.batanasov.medical_record_app.dto.*;
import com.batanasov.medical_record_app.model.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DtoMapper {

    // ---------------- DOCTOR ----------------
    DoctorDTO toDoctorDTO(Doctor entity);
    Doctor toDoctorEntity(DoctorDTO dto);

    List<DoctorDTO> toDoctorDTOList(List<Doctor> entities);
    List<Doctor> toDoctorEntityList(List<DoctorDTO> dtos);

    // new: for list usage
    DoctorListDTO toDoctorListDTO(Doctor entity);
    List<DoctorListDTO> toDoctorListDTOList(List<Doctor> entities);

    // ---------------- PATIENT ----------------
    PatientDTO toPatientDTO(Patient entity);
    Patient toPatientEntity(PatientDTO dto);

    List<PatientDTO> toPatientDTOList(List<Patient> entities);
    List<Patient> toPatientEntityList(List<PatientDTO> dtos);

    // new: for list usage
    PatientListDTO toPatientListDTO(Patient entity);
    List<PatientListDTO> toPatientListDTOList(List<Patient> entities);

    PatientIdDTO toPatientIdDTO(Patient entity);

    // ---------------- DIAGNOSIS ----------------
    DiagnosisDTO toDiagnosisDTO(Diagnosis entity);
    Diagnosis toDiagnosisEntity(DiagnosisDTO dto);

    List<DiagnosisDTO> toDiagnosisDTOList(List<Diagnosis> entities);
    List<Diagnosis> toDiagnosisEntityList(List<DiagnosisDTO> dtos);
    //new: for list usage
    DiagnosisListDTO toDiagnosisListDTO(Diagnosis entity);
    List<DiagnosisListDTO> toDiagnosisListDTOList(List<Diagnosis> entities);

    // ---------------- SICK LEAVE (embedded) ----------------
    SickLeaveDTO toSickLeaveDTO(SickLeave entity);
    SickLeave toSickLeaveEntity(SickLeaveDTO dto);

    // ---------------- VISIT ----------------
    @Mapping(target = "sickLeave", source = "sickLeave")
    VisitDTO toVisitDTO(Visit entity);

    @Mapping(target = "sickLeave", source = "sickLeave")
    Visit toVisitEntity(VisitDTO dto);

    List<VisitDTO> toVisitDTOList(List<Visit> entities);
    List<Visit> toVisitEntityList(List<VisitDTO> dtos);

    //new: for list usage
    VisitListDTO toVisitListDTO(Visit entity);
    List<VisitListDTO> toVisitListDTOList(List<Visit> entities);
}