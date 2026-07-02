package com.interviewai.repository;

import com.interviewai.entity.InterviewResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewResultRepository extends JpaRepository<InterviewResult, Long> {
    Optional<InterviewResult> findByInterviewId(Long interviewId);
    Optional<InterviewResult> findByCertificateId(String certificateId);
}
