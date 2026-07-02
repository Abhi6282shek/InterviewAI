package com.interviewai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "ats_score", nullable = false)
    private Integer atsScore;

    @Column(columnDefinition = "TEXT")
    private String strengths; // JSON Array String

    @Column(columnDefinition = "TEXT")
    private String weaknesses; // JSON Array String

    @Column(name = "recommended_skills", columnDefinition = "TEXT")
    private String recommendedSkills; // JSON Array String

    @Column(columnDefinition = "TEXT")
    private String improvements; // JSON Array String

    @Column(name = "raw_text", columnDefinition = "LONGTEXT")
    private String rawText;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
