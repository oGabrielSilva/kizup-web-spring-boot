package com.social.noble.kizup.controllers.api;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.social.noble.kizup.DTOs.request.SessionRequestDTO;
import com.social.noble.kizup.DTOs.response.SessionResponseDTO;
import com.social.noble.kizup.entities.UserEntity;
import com.social.noble.kizup.repositories.UserRepository;
import com.social.noble.kizup.security.TokenService;
import com.social.noble.kizup.validations.AuthValidation;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/session")
public class SessionRestController {
    @Value("${token.cookies.key}")
    String authorizationCookieKey;

    @Autowired
    AuthenticationManager authManager;
    @Autowired
    UserRepository userRepository;
    @Autowired
    TokenService tokenService;
    @Autowired
    AuthValidation validation;

    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping
    public ResponseEntity<?> sessionIn(@RequestBody SessionRequestDTO sessionDTO, HttpServletResponse response) {
        var validation = sessionDTOGetValidation(sessionDTO);
        if (validation != null) {
            return new ResponseEntity<>(validation, HttpStatus.BAD_REQUEST);
        }
        var userByEmail = userRepository.findByEmail(sessionDTO.email());
        if (userByEmail == null) {
            return new ResponseEntity<>(Map.of("error", "Usuário não encontrado"), HttpStatus.NOT_FOUND);
        }
        try {
            var authenticationToken = new UsernamePasswordAuthenticationToken(sessionDTO.email(),
                    sessionDTO.password());
            var auth = authManager.authenticate(authenticationToken);
            var token = tokenService.generateToken((UserEntity) auth.getPrincipal());
            var cookie = generateAuthorizationCookie(token);
            response.addCookie(cookie);
            return new ResponseEntity<>(SessionResponseDTO.from(token, (UserEntity) auth.getPrincipal()),
                    HttpStatus.OK);
        } catch (AuthenticationException ex) {
            return new ResponseEntity<>(Map.of("error", "Credenciais estão incorretas"), HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/sign-up")
    private ResponseEntity<?> signUp(@RequestBody SessionRequestDTO sessionDTO, HttpServletResponse response) {
        var validation = sessionDTOGetValidation(sessionDTO);
        if (validation != null) {
            return new ResponseEntity<>(validation, HttpStatus.BAD_REQUEST);
        }
        var userExist = userRepository.findByEmail(sessionDTO.email());
        if (userExist != null) {
            try {
                var authenticationToken = new UsernamePasswordAuthenticationToken(sessionDTO.email(),
                        sessionDTO.password());
                var auth = authManager.authenticate(authenticationToken);
                var token = tokenService.generateToken((UserEntity) auth.getPrincipal());
                var cookie = generateAuthorizationCookie(token);
                response.addCookie(cookie);
                return new ResponseEntity<>(SessionResponseDTO.from(token, (UserEntity) auth.getPrincipal()),
                        HttpStatus.OK);
            } catch (AuthenticationException ex) {
                return new ResponseEntity<>(Map.of("error",
                        "Esse email já está cadastrado. Mas não foi possível fazer o login, pois a senha está errada"),
                        HttpStatus.UNAUTHORIZED);
            }
        }
        String passwordEncrypted = passwordEncoder.encode(sessionDTO.password());
        UserEntity user = new UserEntity(sessionDTO.email(), passwordEncrypted);
        userRepository.save(user);
        var token = tokenService.generateToken(user);
        var cookie = generateAuthorizationCookie(token);
        response.addCookie(cookie);
        return new ResponseEntity<>(SessionResponseDTO.from(token, user), HttpStatus.OK);
    }

    @DeleteMapping("/sign-out")
    public ResponseEntity<Void> sessionOff(HttpServletResponse response) {
        response.addCookie(generateAuthorizationCookie(""));
        return ResponseEntity.ok().build();
    }

    private Map<String, String> sessionDTOGetValidation(SessionRequestDTO sessionDTO) {
        if (!validation.emailIsValid(sessionDTO.email())) {
            var model = Map.of("error", "Email é indefinido ou inválido");
            return model;
        }
        if (!validation.passwordIsValid(sessionDTO.password())) {
            var model = Map.of("error", "Senha é indefinida ou inválida. Pelo menos 8 caracteres");
            return model;
        }
        return null;
    }

    private Cookie generateAuthorizationCookie(String token) {
        var cookie = new Cookie(authorizationCookieKey, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60 * 24 * 7);
        return cookie;
    }

}
