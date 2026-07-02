package com.interviewai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "interview_results")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false, unique = true)
    private Interview interview;

    @Column(name = "overall_feedback", nullable = false, columnDefinition = "TEXT")
    private String overallFeedback;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String strengths; // JSON Array String

    @Column(nullable = false, columnDefinition = "TEXT")
    private String weaknesses; // JSON Array String

    @Column(name = "career_recommendations", columnDefinition = "TEXT")
    private String careerRecommendations; // JSON Array String

    @Column(name = "certificate_id", unique = true)
    private String certificateId;
}
