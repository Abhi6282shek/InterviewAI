package com.interviewai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "system_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ai_provider", nullable = false, length = 50)
    private String aiProvider = "MOCK"; // GEMINI, OPENAI, MOCK

    @Column(name = "api_key")
    private String apiKey = "";

    @Column(name = "model_name", nullable = false, length = 50)
    private String modelName = "gemini-1.5-flash";

    @Column(nullable = false)
    private Double temperature = 0.7;

    @Column(name = "system_prompt", columnDefinition = "TEXT")
    private String systemPrompt;
}
