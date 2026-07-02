package com.interviewai.service.impl;

import com.interviewai.service.AiService;
import org.springframework.stereotype.Service;

import java.util.*;

@Service("mockAiService")
public class MockAiServiceImpl implements AiService {

    private static final Map<String, List<Map<String, String>>> QUESTION_BANK = new HashMap<>();

    static {
        // Seed Java questions
        QUESTION_BANK.put("Java", List.of(
            Map.of(
                "questionText", "What is the difference between fail-fast and fail-safe iterators in Java?",
                "idealAnswer", "Fail-fast iterators (like ArrayList's iterator) throw ConcurrentModificationException if the collection is modified structure-wise during iteration. Fail-safe iterators (like ConcurrentHashMap's iterator) operate on a clone or view of the collection and do not throw exceptions."
            ),
            Map.of(
                "questionText", "Explain the Java Memory Model (JMM) and how the volatile keyword works.",
                "idealAnswer", "The JMM defines how threads interact through memory. The volatile keyword guarantees visibility: changes made by one thread to a volatile variable are immediately written to main memory and visible to all other threads, preventing threads from reading cached/stale values."
            ),
            Map.of(
                "questionText", "What are Java Streams, and how do intermediate operations differ from terminal operations?",
                "idealAnswer", "Java Streams process sequences of elements. Intermediate operations (like map, filter) are lazy, return a new Stream, and do not execute until a terminal operation is called. Terminal operations (like collect, forEach) trigger the stream pipeline execution and return a non-stream result."
            )
        ));

        // Seed SQL questions
        QUESTION_BANK.put("SQL", List.of(
            Map.of(
                "questionText", "What is the difference between WHERE and HAVING clauses in SQL?",
                "idealAnswer", "The WHERE clause is used to filter individual rows before any aggregations or groupings are performed. The HAVING clause is used to filter groups created by the GROUP BY clause, executing after row aggregation."
            ),
            Map.of(
                "questionText", "What are indexes in databases, and what are their pros and cons?",
                "idealAnswer", "Indexes are data structures (typically B-Trees) that speed up query retrieval. Pros: significantly faster SELECT queries. Cons: extra storage space required, and slower INSERT, UPDATE, and DELETE operations since indexes must be updated too."
            ),
            Map.of(
                "questionText", "Explain the differences between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN.",
                "idealAnswer", "INNER JOIN returns only rows that have matching values in both tables. LEFT JOIN returns all rows from the left table and matched rows from the right table (unmatched right columns return NULL). FULL OUTER JOIN returns all rows from both tables, filling NULLs for missing matches."
            )
        ));

        // Seed HR questions
        QUESTION_BANK.put("HR Interview", List.of(
            Map.of(
                "questionText", "Tell me about a time you faced a difficult technical challenge and how you resolved it.",
                "idealAnswer", "The answer should follow the STAR method (Situation, Task, Action, Result). Highlight how you analyzed the root cause, researched solutions, collaborated with others, implemented the fix, and verified the outcome."
            ),
            Map.of(
                "questionText", "How do you handle conflict or differing technical opinions within a team?",
                "idealAnswer", "A good answer demonstrates active listening, emotional intelligence, objective comparison of data/pros-cons, and a collaborative effort to compromise or align with the team's goals and timeline."
            ),
            Map.of(
                "questionText", "Why do you want to join our company, and what makes you a good fit?",
                "idealAnswer", "A strong answer connects the company's mission and technical stack with your personal skills, career goals, and experience, showing enthusiasm for their products and culture."
            )
        ));
    }

    @Override
    public List<Map<String, String>> generateQuestions(String category, String difficulty, String type) {
        List<Map<String, String>> questions = QUESTION_BANK.getOrDefault(category, QUESTION_BANK.get("Java"));
        
        // Return a modifiable list to the caller
        List<Map<String, String>> result = new ArrayList<>();
        for (Map<String, String> q : questions) {
            Map<String, String> copy = new HashMap<>(q);
            // Append category, difficulty and type context just to make it dynamic
            copy.put("questionText", copy.get("questionText") + " (" + difficulty + " " + type + " context)");
            result.add(copy);
        }
        return result;
    }

    @Override
    public Map<String, Object> evaluateAnswer(String questionText, String userAnswer) {
        Map<String, Object> evaluation = new HashMap<>();
        
        if (userAnswer == null || userAnswer.trim().isEmpty()) {
            evaluation.put("score", 0);
            evaluation.put("feedback", "No answer was provided. You must provide a typed or spoken answer for evaluation.");
            return evaluation;
        }

        // Run keyword overlap checking for smart grading
        String userLower = userAnswer.toLowerCase();
        int score = 55; // base score for writing something
        List<String> positiveMatches = new ArrayList<>();

        String[] keywords = {"exception", "fail", "clone", "volatile", "thread", "memory", "visibility", "stream", 
                             "lazy", "filter", "group", "aggregate", "index", "b-tree", "join", "star", "listen", "collaborate"};

        for (String keyword : keywords) {
            if (userLower.contains(keyword)) {
                score += 5;
                positiveMatches.add(keyword);
            }
        }

        // Adjust score based on length of response
        if (userAnswer.length() > 200) {
            score += 10;
        } else if (userAnswer.length() > 80) {
            score += 5;
        }

        score = Math.min(score, 98); // cap at 98 for mock

        // Generate feedback string based on score and keywords matched
        String feedback;
        if (score >= 85) {
            feedback = "Excellent answer! You correctly covered key technical terms: " + String.join(", ", positiveMatches) + ". Your explanation is clear and demonstrates a solid understanding of the concepts.";
        } else if (score >= 70) {
            feedback = "Good response. You mentioned " + String.join(", ", positiveMatches) + ", which is correct. To improve, try adding more depth and specific examples of how this is applied in real-world scenarios.";
        } else {
            feedback = "Your answer is partially correct but lacks key details. Focus on describing core concepts like the underlying data structures, visibility rules, or lifecycle mechanics depending on the question context.";
        }

        evaluation.put("score", score);
        evaluation.put("feedback", feedback);
        return evaluation;
    }

    @Override
    public Map<String, Object> analyzeResume(String resumeText) {
        Map<String, Object> analysis = new HashMap<>();
        
        if (resumeText == null || resumeText.trim().isEmpty()) {
            analysis.put("atsScore", 10);
            analysis.put("strengths", List.of("Readable file name"));
            analysis.put("weaknesses", List.of("Empty resume content"));
            analysis.put("recommendedSkills", List.of("Add technical skills"));
            analysis.put("improvements", List.of("Ensure the PDF is not an image and contains extractable text"));
            return analysis;
        }

        String textLower = resumeText.toLowerCase();
        int score = 40; // Base score
        List<String> strengths = new ArrayList<>();
        List<String> weaknesses = new ArrayList<>();
        List<String> recommendedSkills = new ArrayList<>();
        List<String> improvements = new ArrayList<>();

        // Smart skill checking
        if (textLower.contains("java") || textLower.contains("c++") || textLower.contains("python")) {
            score += 15;
            strengths.add("Strong OOP programming foundations");
        } else {
            weaknesses.add("Lacks explicit object-oriented programming languages");
            recommendedSkills.add("Java or C++");
        }

        if (textLower.contains("spring") || textLower.contains("django") || textLower.contains("node")) {
            score += 15;
            strengths.add("Back-end framework familiarity");
        } else {
            weaknesses.add("No modern back-end framework listed");
            recommendedSkills.add("Spring Boot (Java) or Express (Node.js)");
        }

        if (textLower.contains("sql") || textLower.contains("mongo")) {
            score += 15;
            strengths.add("Database management experience");
        } else {
            weaknesses.add("Lacks relational/non-relational database skills");
            recommendedSkills.add("MySQL, PostgreSQL, or MongoDB");
        }

        if (textLower.contains("docker") || textLower.contains("kubernetes") || textLower.contains("aws") || textLower.contains("git")) {
            score += 10;
            strengths.add("DevOps and version control awareness");
        } else {
            improvements.add("Include deployment technologies and Git workflows in your projects section");
            recommendedSkills.add("Git, Docker, and AWS");
        }

        // Overall suggestions
        improvements.add("Add quantified achievements in project bullet points (e.g., 'Improved query performance by 40%')");
        improvements.add("Format layout to a clean single-column structure for better ATS parsing");

        if (strengths.isEmpty()) {
            strengths.add("Basic technical resume structure");
        }
        if (weaknesses.isEmpty()) {
            weaknesses.add("No glaring gaps detected, ready for general junior roles");
        }

        score = Math.min(score, 95);

        analysis.put("atsScore", score);
        analysis.put("strengths", strengths);
        analysis.put("weaknesses", weaknesses);
        analysis.put("recommendedSkills", recommendedSkills);
        analysis.put("improvements", improvements);
        return analysis;
    }
}
