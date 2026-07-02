package com.interviewai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InterviewSetupRequest {
    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Difficulty is required")
    private String difficulty;

    @NotBlank(message = "Type is required")
    private String type;
}
