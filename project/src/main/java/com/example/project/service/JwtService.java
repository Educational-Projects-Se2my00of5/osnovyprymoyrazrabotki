package com.example.project.service;

import com.example.project.entity.User;
import com.example.project.exception.AuthenticationException;
import com.example.project.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.function.Function;


@Slf4j
@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long accessTokenExpiration,
            @Value("${jwt.refresh-expiration}") long refreshTokenExpiration
    ) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    public String generateAccessToken(User user) {
        return generateToken(user, TokenType.ACCESS);
    }

    public String generateRefreshToken(User user) {
        return generateToken(user, TokenType.REFRESH);
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException expEx) {
            //log.error("Token expired", expEx);
            throw new AuthenticationException("Token expired");
        } catch (UnsupportedJwtException unsEx) {
            //log.error("Unsupported jwt", unsEx);
            throw new AuthenticationException("Unsupported jwt");
        } catch (MalformedJwtException mjEx) {
            //log.error("Malformed jwt", mjEx);
            throw new AuthenticationException("Malformed jwt");
        } catch (Exception e) {
            //log.error("invalid token", e);
            throw new AuthenticationException("invalid token");
        }
    }

    public String extractEmailFromToken(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractEmailFromHeader(String authHeader) {
        String token = extractTokenFromHeader(authHeader);
        return extractEmailFromToken(token);
    }

    public Long extractUserIdFromToken(String token) {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }

    public Long extractUserIdFromHeader(String authHeader) {
        String token = extractTokenFromHeader(authHeader);
        return extractUserIdFromToken(token);
    }


    private String generateToken(User user, TokenType type) {
        long nowMillis = System.currentTimeMillis();
        long expiration = (type == TokenType.ACCESS) ? accessTokenExpiration : refreshTokenExpiration;

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .issuedAt(Date.from(Instant.ofEpochMilli(nowMillis)))
                .expiration(Date.from(Instant.ofEpochMilli(nowMillis + expiration)))
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    private enum TokenType {
        ACCESS, REFRESH
    }


    /**
     * Извлечение конкретного claim
     */
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Извлечение всех claims из токена
     */
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Ошибка парсинга JWT: {}", e.getMessage());
            throw new AuthenticationException("Невалидный JWT токен");
        }
    }

    /**
     * Извлечение токена из Authorization header
     */
    private String extractTokenFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AuthenticationException("Authorization header отсутствует или имеет неверный формат");
        }
        return authHeader.substring(7);
    }




    /**
     * Извлечение даты истечения
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}
