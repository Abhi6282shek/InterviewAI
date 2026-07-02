package com.interviewai.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AnswerSubmissionRequest {
    @NotNull(message = "Question ID is required")
    private Long questionId;

    private String userAnswer;
    
    private Integer timeTakenSeconds = 0;
}
