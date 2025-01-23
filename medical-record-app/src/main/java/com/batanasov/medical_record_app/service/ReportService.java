package com.batanasov.medical_record_app.service;

import com.batanasov.medical_record_app.dto.*;
import com.batanasov.medical_record_app.mapper.DtoMapper;
import com.batanasov.medical_record_app.model.Patient;
import com.batanasov.medical_record_app.model.Visit;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;

import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;
import com.batanasov.medical_record_app.repository.DoctorRepository;
import com.batanasov.medical_record_app.repository.PatientRepository;
import com.batanasov.medical_record_app.repository.VisitRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final VisitRepository visitRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final MongoTemplate mongoTemplate;
    private final DtoMapper mapper; // to map entities to DTO if needed

    @Autowired
    public ReportService(VisitRepository visitRepository,
                         PatientRepository patientRepository,
                         DoctorRepository doctorRepository,
                         MongoTemplate mongoTemplate,
                         DtoMapper mapper) {
        this.visitRepository = visitRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.mongoTemplate = mongoTemplate;
        this.mapper = mapper;
    }

    // List of Patients With a Given Diagnosis
    public List<PatientDTO> getPatientsByDiagnosis(String diagnosisId) {
        // find visits that contain this diagnosis
        List<Visit> visits = visitRepository.findByDiagnosisIds(diagnosisId);

        // distinct patientIds from those visits
        Set<String> patientIds = visits.stream()
                .map(Visit::getPatientId)
                .collect(Collectors.toSet());

        // load all patients with those IDs
        List<Patient> patients = patientRepository.findAllById(patientIds);

        // map to DTO
        return mapper.toPatientDTOList(patients);
    }

    //Which Diagnoses Are Most Frequent
    public List<DiagnosisFrequencyResult> getMostFrequentDiagnoses(int topN) {

        // This aggregation performs the following steps:
        // 1. Unwinds the "diagnosisIds" array, creating a separate document for each element in the array.
        // 2. Groups the documents by "diagnosisIds" and counts the number of occurrences of each diagnosis ID.
        // 3. Sorts the grouped documents by the count in descending order.
        // 4. Limits the result to the top N documents based on the count.
        Aggregation agg = Aggregation.newAggregation(
                Aggregation.unwind("diagnosisIds"),
                Aggregation.group("diagnosisIds").count().as("count"),
                Aggregation.sort(Sort.by(Sort.Direction.DESC, "count")),
                Aggregation.limit(topN)
        );

        AggregationResults<Document> results =
                mongoTemplate.aggregate(agg, "visits", Document.class);

        // parse results
        List<DiagnosisFrequencyResult> output = results.getMappedResults()
                .stream()
                .map(doc -> {
                    String diagId = doc.getString("_id");
                    Number numberVal = doc.get("count", Number.class);  // handles int or long
                    long count = numberVal.longValue();
                    return new DiagnosisFrequencyResult(diagId, count);
                })
                .collect(Collectors.toList());

        return output;
    }

    // List of Patients Who Have a Specific Personal Doctor
    public List<PatientDTO> getPatientsByPersonalDoctor(String doctorId) {
        List<Patient> patients = patientRepository.findByPersonalDoctorId(doctorId);
        return mapper.toPatientDTOList(patients);
    }

    public List<DoctorPatientCount> getPatientCountByDoctor() {

        // This aggregation groups patients by their personal doctor ID,
        // counts the number of patients per doctor
        // sorts the results in descending order of patient count.
        Aggregation agg = Aggregation.newAggregation(
                Aggregation.group("personalDoctorId").count().as("count"),
                Aggregation.sort(Sort.by(Sort.Direction.DESC, "count"))
        );

        AggregationResults<Document> results =
                mongoTemplate.aggregate(agg, "patients", Document.class);

        // parse results
        List<DoctorPatientCount> output = results.getMappedResults().stream()
                .map(doc -> {
                    String doctorId = doc.getString("_id");
                    Number numberVal = doc.get("count", Number.class);  // handles int or long
                    long count = numberVal.longValue();
                    return new DoctorPatientCount(doctorId, count);
                })
                .collect(Collectors.toList());

        return output;
    }

    public List<DoctorVisitCount> getVisitCountByDoctor() {

        // This aggregation groups visits by doctor ID, counts the number of visits per doctor,
        // and sorts the results in descending order of visit count.
        Aggregation agg = Aggregation.newAggregation(
                Aggregation.group("doctorId").count().as("visitCount"),
                Aggregation.sort(Sort.by(Sort.Direction.DESC, "visitCount"))
        );

        AggregationResults<Document> results =
                mongoTemplate.aggregate(agg, "visits", Document.class);

        //parse results to dto
        List<DoctorVisitCount> output = results.getMappedResults().stream()
                .map(doc -> {
                    String doctorId = doc.getString("_id");
                    Number numberVal = doc.get("visitCount", Number.class);  // handles int or long
                    long visitCount = numberVal.longValue();
                    return new DoctorVisitCount(doctorId, visitCount);
                })
                .collect(Collectors.toList());
        return output;
    }

    // List of Visits Grouped by Patient
    public List<VisitsByPatientResult> getAllVisitsGroupedByPatient() {

        // Group visits by patientId and collect visitIds into a list
        Aggregation agg = Aggregation.newAggregation(
                Aggregation.group("patientId")
                        .push("$_id").as("visitIds")
                // or .push("$$ROOT").as("visits") if you want the entire documents
        );

        AggregationResults<Document> results =
                mongoTemplate.aggregate(agg, "visits", Document.class);

        List<VisitsByPatientResult> output = results.getMappedResults()
                .stream()
                .map(doc -> {
                    String patientId = doc.getString("_id");

                    // read the array of _id fields as ObjectIds
                    List<ObjectId> rawIds = doc.getList("visitIds", ObjectId.class);

                    // convert each ObjectId to its hex string
                    List<String> visitIds = rawIds.stream()
                            .map(ObjectId::toHexString)
                            .collect(Collectors.toList());

                    return new VisitsByPatientResult(patientId, visitIds);
                })
                .collect(Collectors.toList());

        return output;
    }

    // List of Visits in a Date Range
    public List<VisitDTO> getVisitsInDateRange(LocalDate start, LocalDate end) {
        List<Visit> visits = visitRepository.findByVisitDateBetween(start, end);
        return mapper.toVisitDTOList(visits);
    }

    // List of Visits for a Specific Doctor in a Date Range
    public List<VisitDTO> getVisitsForDoctorInDateRange(String doctorId, LocalDate start, LocalDate end) {
        List<Visit> visits = visitRepository.findByDoctorIdAndVisitDateBetween(doctorId, start, end);
        return mapper.toVisitDTOList(visits);
    }

    public Integer getMonthWithMostSickLeaves() {

        // This aggregation performs the following steps:
        // 1. Matches documents where "sickLeave" is not null.
        // 2. Projects the month from "sickLeave.startDate".
        // 3. Groups the documents by the projected month and counts the occurrences.
        // 4. Sorts the grouped documents by the count in descending order.
        // 5. Limits the result to the top document based on the count.

                Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("sickLeave").ne(null)),
                Aggregation.project().andExpression("month($sickLeave.startDate)").as("monthVal"),
                Aggregation.group("monthVal").count().as("count"),
                Aggregation.sort(Sort.by(Sort.Direction.DESC, "count")),
                Aggregation.limit(1)
        );

        AggregationResults<Document> results =
                mongoTemplate.aggregate(agg, "visits", Document.class);

        if (results.getMappedResults().isEmpty()) {
            return 0; // no sick leaves at all
        }
        Document topDoc = results.getMappedResults().get(0);

        // { "_id" : 5, "count" : 7 }
        return topDoc.getInteger("_id");
    }

    public List<DoctorSickLeaveCount> getDoctorsByMostSickLeaves(int topN) {

        Aggregation agg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("sickLeave").ne(null)),
                Aggregation.group("doctorId").count().as("sickLeaveCount"),
                Aggregation.sort(Sort.by(Sort.Direction.DESC, "sickLeaveCount")),
                Aggregation.limit(topN)
        );

        AggregationResults<Document> results =
                mongoTemplate.aggregate(agg, "visits", Document.class);

        List<DoctorSickLeaveCount> output = results.getMappedResults().stream()
                .map(doc -> {
                    String doctorId = doc.getString("_id");
                    Number numberVal = doc.get("sickLeaveCount", Number.class);  // handles int or long
                    long sickLeaveCount = numberVal.longValue();
                    return new DoctorSickLeaveCount(doctorId, sickLeaveCount);
                })
                .collect(Collectors.toList());

        return output;
    }
}