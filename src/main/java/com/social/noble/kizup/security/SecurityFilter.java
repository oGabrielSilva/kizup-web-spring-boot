package com.social.noble.kizup.security;

import java.io.IOException;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.social.noble.kizup.repositories.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Value("${token.cookies.key}")
    String authorizationCookieKey;

    @Autowired
    TokenService tokenService;
    @Autowired
    UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = recoveryToken(request);
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }
        String subject = tokenService.getTokenSubject(token);
        UserDetails user = userRepository.findByEmail(subject);
        System.out.println("USER: " + user);
        if (user == null) {
            filterChain.doFilter(request, response);
            return;
        }
        var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        return request.getServletPath().startsWith("/static");
    }

    private String recoveryToken(HttpServletRequest request) {
        var authorization = request.getHeader("Authorization");

        var cookies = request.getCookies();
        if (cookies != null) {
            for (var cookie : Stream.of(cookies).toList()) {
                if (cookie.getName().equals(authorizationCookieKey)
                        && (authorization == null || authorization.isBlank())) {
                    authorization = cookie.getValue();
                }
            }
        }

        if ((authorization == null || authorization.isBlank())) {
            return null;
        }
        var token = authorization.contains(" ") ? authorization.split(" ")[1] : authorization;
        return token;
    }
}
