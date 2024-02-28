package com.social.noble.kizup.security;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.social.noble.kizup.entities.UserEntity;

@Service
public class TokenService {
    private final Algorithm algorithm;
    private final String issuer;

    public TokenService(@Value("${token.secret}") final String secret, @Value("${token.issuer}") final String issuer) {
        algorithm = Algorithm.HMAC256(secret);
        this.issuer = issuer;
    }

    public String generateToken(UserEntity user) {
        try {
            return JWT.create()
                    .withIssuer(issuer)
                    .withSubject(user.getEmail()).withClaim("uuid", user.getID().toString())
                    .withExpiresAt(getTokenExpires()).sign(algorithm);
        } catch (Exception ex) {
            throw new RuntimeException("Erro ao gerar token de autenticação", ex);
        }
    }

    public String getTokenSubject(String token) {
        try {
            return JWT.require(algorithm).withIssuer(issuer).build().verify(token).getSubject();
        } catch (Exception e) {
            return "";
        }
    }

    private Instant getTokenExpires() {
        return LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00"));
    }
}
