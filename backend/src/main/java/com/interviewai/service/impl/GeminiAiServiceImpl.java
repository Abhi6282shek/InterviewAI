package com.interviewai.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewai.service.AiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service("geminiAiService")
@Primary
public class GeminiAiServiceImpl implements AiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final MockAiServiceImpl mockAiService;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public GeminiAiServiceImpl(MockAiServiceImpl mockAiService) {
        this.mockAiService = mockAiService;
        this.objectMapper = new ObjectMapper();
        this.restTemplate = new RestTemplate();
    }

    private boolean isApiKeyConfigured() {
        return apiKey != null && !apiKey.trim().isEmpty() && !apiKey.equalsIgnoreCase("MOCK");
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<Map<String, String>> generateQuestions(String category, String difficulty, String type) {
        if (!isApiKeyConfigured()) {
            return mockAiService.generateQuestions(category, difficulty, type);
        }

        try {
            String prompt = String.format(
                "You are an expert interviewer. Generate exactly 5 interview questions for a candidate practicing '%s' at '%s' level for a '%s' interview. " +
                "Format the response ONLY as a JSON array of objects, where each object has exactly two keys: 'questionText' and 'idealAnswer'. " +
                "Do not write any other text, markdown blocks, or explanation. Only output raw JSON.",
                category, difficulty, type
            );

            String rawResponse = callGemini(prompt);
            String cleanJson = cleanMarkdownJson(rawResponse);
            
            return objectMapper.readValue(cleanJson, List.class);
        } catch (Exception e) {
            System.err.println("Error calling Gemini for generateQuestions, falling back to mock: " + e.getMessage());
            return mockAiService.generateQuestions(category, difficulty, type);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> evaluateAnswer(String questionText, String userAnswer) {
        if (!isApiKeyConfigured()) {
            return mockAiService.evaluateAnswer(questionText, userAnswer);
        }

        try {
            String prompt = String.format(
                "Evaluate the candidate's answer for the following question:\n" +
                "Question: %s\n" +
                "Answer: %s\n\n" +
                "Grade the answer on a scale of 0 to 100. Provide clear, constructive feedback on strengths, weaknesses, and what was missing. " +
                "Format the response ONLY as a JSON object with exactly two keys: 'score' (must be an integer between 0 and 100) and 'feedback' (a text string). " +
                "Do not write any other text, markdown blocks, or explanation. Only output raw JSON.",
                questionText, userAnswer
            );

            String rawResponse = callGemini(prompt);
            String cleanJson = cleanMarkdownJson(rawResponse);
            
            return objectMapper.readValue(cleanJson, Map.class);
        } catch (Exception e) {
            System.err.println("Error calling Gemini for evaluateAnswer, falling back to mock: " + e.getMessage());
            return mockAiService.evaluateAnswer(questionText, userAnswer);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, Object> analyzeResume(String resumeText) {
        if (!isApiKeyConfigured()) {
            return mockAiService.analyzeResume(resumeText);
        }

        try {
            String prompt = String.format(
                "You are an advanced Applicant Tracking System (ATS) and Career Coach. Analyze the following resume text:\n" +
                "%s\n\n" +
                "Evaluate the resume and return a JSON object with the following keys:\n" +
                "1. 'atsScore': integer between 0 and 100\n" +
                "2. 'strengths': array of strings listing key strengths\n" +
                "3. 'weaknesses': array of strings listing weaknesses or gaps\n" +
                "4. 'recommendedSkills': array of strings listing missing recommended technologies\n" +
                "5. 'improvements': array of strings listing actionable improvement suggestions\n\n" +
                "Format the response ONLY as a JSON object. Do not include markdown code blocks, backticks, or explanation. Only output raw JSON.",
                resumeText
            );

            String rawResponse = callGemini(prompt);
            String cleanJson = cleanMarkdownJson(rawResponse);
            
            return objectMapper.readValue(cleanJson, Map.class);
        } catch (Exception e) {
            System.err.println("Error calling Gemini for analyzeResume, falling back to mock: " + e.getMessage());
            return mockAiService.analyzeResume(resumeText);
        }
    }

    private String callGemini(String prompt) throws Exception {
        String url = apiUrl + "?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Body Structure for Gemini v1beta API
        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> body = Map.of("contents", List.of(content));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        String responseStr = restTemplate.postForObject(url, request, String.class);

        // Extract the generated text using Jackson
        JsonNode root = objectMapper.readTree(responseStr);
        JsonNode candidates = root.path("candidates");
        if (candidates.isArray() && !candidates.isEmpty()) {
            JsonNode candidate = candidates.get(0);
            JsonNode contentNode = candidate.path("content");
            JsonNode parts = contentNode.path("parts");
            if (parts.isArray() && !parts.isEmpty()) {
                return parts.get(0).path("text").asText();
            }
        }
        throw new RuntimeException("Could not parse text from Gemini response: " + responseStr);
    }

    /**
     * Cleans up common LLM markdown decorations like ```json ... ``` wrappers.
     */
    private String cleanMarkdownJson(String rawText) {
        if (rawText == null) return "{}";
        String cleaned = rawText.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }
}
