package com.interviewai.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTests {

    private JwtTokenProvider tokenProvider;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider();
        // Inject values using Spring Test Reflection Utils
        ReflectionTestUtils.setField(tokenProvider, "secret", "5J6m9L2pQ1sT8wV3xY7zA4B0C9D8E7F6G5H4I3J2K1L0M9N8O7P6Q5R4S3T2U1V");
        ReflectionTestUtils.setField(tokenProvider, "expirationMs", 3600000L); // 1 hour
    }

    @Test
    void generateAndValidateToken() {
        String email = "test@example.com";
        String role = "ROLE_USER";

        String token = tokenProvider.generateToken(email, role);
        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));

        assertEquals(email, tokenProvider.getEmailFromToken(token));
        assertEquals(role, tokenProvider.getRoleFromToken(token));
    }

    @Test
    void invalidTokenFails() {
        assertFalse(tokenProvider.validateToken("invalid-token-string"));
    }
}
