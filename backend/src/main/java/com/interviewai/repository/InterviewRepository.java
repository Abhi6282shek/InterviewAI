package com.interviewai.repository;

import com.interviewai.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Interview> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);
    
    long countByUserId(Long userId);
    
    @Query("SELECT MAX(i.score) FROM Interview i WHERE i.user.id = :userId AND i.status = 'COMPLETED'")
    Integer findHighestScoreByUserId(Long userId);
    
    @Query("SELECT AVG(i.score) FROM Interview i WHERE i.user.id = :userId AND i.status = 'COMPLETED'")
    Double findAverageScoreByUserId(Long userId);
}
