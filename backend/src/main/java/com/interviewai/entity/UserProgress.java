package com.interviewai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "total_interviews")
    private Integer totalInterviews = 0;

    @Column(name = "average_score")
    private Double averageScore = 0.0;

    @Column(name = "highest_score")
    private Integer highestScore = 0;

    @Column(name = "completed_categories", columnDefinition = "TEXT")
    private String completedCategories; // JSON String or map representing category -> count

    @UpdateTimestamp
    @Column(name = "last_activity", nullable = false)
    private LocalDateTime lastActivity;
}
