package com.social.noble.kizup.validations;

import org.springframework.stereotype.Component;

@Component
public class AuthValidation {
    private final String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

    public Boolean emailIsValid(String email) {
        return email != null && email.matches(emailRegex);
    }

    public Boolean passwordIsValid(String password) {
        return password != null && password.length() >= 8;
    }
}
