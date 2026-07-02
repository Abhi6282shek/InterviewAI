-- Seed Data for InterviewAI (H2 and MySQL Compatible)

-- 1. Insert Default System Settings
INSERT INTO system_settings (ai_provider, api_key, model_name, temperature, system_prompt)
VALUES ('MOCK', '', 'gemini-1.5-flash', 0.7, 'You are an elite technical and HR interviewer. Evaluate user answers objectively, grade them on a scale of 0-100, and provide clear constructive feedback.');

-- 2. Insert Default Users (Password: admin123 -> BCrypt hash)
INSERT INTO users (email, password, full_name, role, skills, bio, created_at, updated_at)
VALUES 
('admin@interviewai.com', '$2a$10$PFr41AQU9GzPVgtRRgScsO50cXkOvRpTJy8S8jYUDY13JxVicC/y6', 'Admin Root', 'ROLE_ADMIN', 'Java, Spring Boot, MySQL, Security', 'Platform administrator and developer.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user@interviewai.com', '$2a$10$PFr41AQU9GzPVgtRRgScsO50cXkOvRpTJy8S8jYUDY13JxVicC/y6', 'John Doe', 'ROLE_USER', 'Java, JavaScript, Python', 'Software engineer looking for React/Spring Boot full stack roles.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. Insert Initial Progress for Seed User
INSERT INTO user_progress (user_id, total_interviews, average_score, highest_score, completed_categories, last_activity)
VALUES (2, 2, 82.5, 85, '{"Java": 1, "SQL": 1}', CURRENT_TIMESTAMP);

-- 4. Seed Interviews & Results history for John Doe (user_id = 2)
INSERT INTO interviews (id, user_id, category, difficulty, type, status, score, duration_seconds, created_at, completed_at)
VALUES 
(1, 2, 'Java', 'Intermediate', 'Technical', 'COMPLETED', 85, 450, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 'SQL', 'Beginner', 'Technical', 'COMPLETED', 80, 300, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO interview_results (interview_id, overall_feedback, strengths, weaknesses, career_recommendations, certificate_id)
VALUES 
(1, 'Strong core Java knowledge. Demonstrates clear understanding of OOP and multi-threading. Needs minor improvement in JVM memory tuning and garbage collection details.', '["OOP Principles", "Multi-threading basics", "Java Streams API"]', '["JVM Memory Management", "Garbage collection algorithms"]', '["Read Java Concurrency in Practice", "Practice JVM sizing and monitoring tools"]', 'CERT-JAVA-12345'),
(2, 'Good grasp of basic relational queries, joins, and aggregations. Indexing and optimization strategies could be stronger.', '["Inner and Outer Joins", "GROUP BY Aggregations", "Basic Subqueries"]', '["Index selection", "Execution plan reading"]', '["Study SQL Indexing basics", "Practice writing CTEs and window functions"]', 'CERT-SQL-67890');
