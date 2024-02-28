package com.social.noble.kizup.controllers.api;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.social.noble.kizup.entities.UserEntity;
import com.social.noble.kizup.repositories.UserRepository;
import com.social.noble.kizup.security.TokenService;
import com.social.noble.kizup.validations.AuthValidation;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/user")
public class UserRestController {
    @Value("${token.cookies.key}")
    String authorizationCookieKey;
    @Autowired
    UserRepository repository;
    @Autowired
    PasswordEncoder encoder;
    @Autowired
    AuthValidation validation;
    @Autowired
    TokenService tokenService;

    @PatchMapping("/name")
    public ResponseEntity<?> updateName(@RequestBody Map<String, String> map,
            @AuthenticationPrincipal UserEntity user) {
        var name = map.get("name");
        if (name == null || name.isBlank()) {
            return new ResponseEntity<>(Map.of("error", "Não foi fornecido um nome válido"), HttpStatus.BAD_REQUEST);
        }
        if (name.equals(user.getName())) {
            return new ResponseEntity<>(Map.of("error", "O novo nome não pode ser igual ao anterior"),
                    HttpStatus.BAD_REQUEST);
        }
        user.setName(name);
        repository.save(user);
        return new ResponseEntity<>(Map.of("message", "Sucesso! Seu nome agora é " + name), HttpStatus.OK);
    }

    @PatchMapping("/email")
    public ResponseEntity<?> updateEmail(@RequestBody Map<String, String> map,
            @AuthenticationPrincipal UserEntity user, HttpServletResponse response) {
        var email = map.get("email");
        if (email == null || email.isBlank()) {
            return new ResponseEntity<>(Map.of("error", "Não foi fornecido nenhum email"), HttpStatus.BAD_REQUEST);
        }
        if (!validation.emailIsValid(email)) {
            return new ResponseEntity<>(Map.of("error", "O email fornecido não foi considerado válido"),
                    HttpStatus.BAD_REQUEST);
        }
        if (email.equals(user.getEmail())) {
            return new ResponseEntity<>(Map.of("error", "O novo email não pode ser igual ao anterior"),
                    HttpStatus.BAD_REQUEST);
        }
        var userByEmail = repository.findByEmail(email);
        if (userByEmail != null) {
            return new ResponseEntity<>(Map.of("error", "Email informado já está cadastrado"),
                    HttpStatus.CONFLICT);
        }
        var password = map.get("password");
        if (password == null || password.isBlank()) {
            return new ResponseEntity<>(
                    Map.of("error",
                            "É necessário que seja fornecida a senha atual para que possamos trocar o seu email"),
                    HttpStatus.BAD_REQUEST);
        }
        if (!validation.passwordIsValid(password)) {
            return new ResponseEntity<>(Map.of("error", "A senha fornecida não é válida"),
                    HttpStatus.BAD_REQUEST);
        }
        if (!encoder.matches(password, user.getPassword())) {
            return new ResponseEntity<>(Map.of("error", "Credenciais inválidas"), HttpStatus.UNAUTHORIZED);
        }

        user.setEmail(email);
        repository.save(user);
        var token = tokenService.generateToken(user);
        var cookie = generateAuthorizationCookie(token);
        response.addCookie(cookie);
        return new ResponseEntity<>(Map.of("message", "Sucesso! Seu email agora é " + email, "token", token),
                HttpStatus.OK);
    }

    @PatchMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> map,
            @AuthenticationPrincipal UserEntity user, HttpServletResponse response) {
        var password = map.get("password");
        if (password == null || password.isBlank()) {
            return new ResponseEntity<>(Map.of("error", "Precisa ser fornecido uma senha"), HttpStatus.BAD_REQUEST);
        }
        if (!validation.passwordIsValid(password)) {
            return new ResponseEntity<>(Map.of("error", "A senha fornecida não foi considerada válida"),
                    HttpStatus.BAD_REQUEST);
        }
        var newPassword = map.get("newPassword");
        if (newPassword == null || newPassword.isBlank()) {
            return new ResponseEntity<>(Map.of("error", "A nova senha não foi fornecida"), HttpStatus.BAD_REQUEST);
        }
        if (!validation.passwordIsValid(newPassword)) {
            return new ResponseEntity<>(Map.of("error", "A nova senha não foi considerada válida"),
                    HttpStatus.BAD_REQUEST);
        }
        if (!encoder.matches(password, user.getPassword())) {
            return new ResponseEntity<>(Map.of("error", "Credenciais inválidas"), HttpStatus.UNAUTHORIZED);
        }

        if (encoder.matches(newPassword, user.getPassword())) {
            return new ResponseEntity<>(Map.of("message", "Sucesso! Sua senha foi alterada"),
                    HttpStatus.OK);
        }

        user.setPassword(encoder.encode(newPassword));
        repository.save(user);
        var token = tokenService.generateToken(user);
        var cookie = generateAuthorizationCookie(token);
        response.addCookie(cookie);
        return new ResponseEntity<>(Map.of("message", "Sucesso! Sua senha foi alterada", "token", token),
                HttpStatus.OK);
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
