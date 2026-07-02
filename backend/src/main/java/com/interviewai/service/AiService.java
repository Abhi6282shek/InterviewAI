package com.interviewai.service;

import java.util.List;
import java.util.Map;

public interface AiService {
    
    /**
     * Generates interview questions based on category, difficulty, and type.
     * Returns a list of maps, each containing "questionText" and "idealAnswer".
     */
    List<Map<String, String>> generateQuestions(String category, String difficulty, String type);
    
    /**
     * Evaluates a single question and answer.
     * Returns a map containing "score" (Integer) and "feedback" (String).
     */
    Map<String, Object> evaluateAnswer(String questionText, String userAnswer);
    
    /**
     * Analyzes resume text and generates ATS feedback.
     * Returns a map containing "atsScore" (Integer), "strengths" (List<String>),
     * "weaknesses" (List<String>), "recommendedSkills" (List<String>), and "improvements" (List<String>).
     */
    Map<String, Object> analyzeResume(String resumeText);
}
