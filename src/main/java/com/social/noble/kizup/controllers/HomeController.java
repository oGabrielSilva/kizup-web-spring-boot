package com.social.noble.kizup.controllers;

import java.security.Principal;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import com.social.noble.kizup.DTOs.response.UserDTO;
import com.social.noble.kizup.entities.UserEntity;
import com.social.noble.kizup.repositories.UserRepository;

@Controller
@RequestMapping("/")
public class HomeController {
    @Value("${cloud.project.id}")
    String projectId;
    @Autowired
    UserRepository userRepository;

    @GetMapping
    public ModelAndView index(Principal principal) {
        var original = recoveryUser(principal);
        if (original != null) {
            return new ModelAndView("index", Map.of("user", UserDTO.fromEntity(original)));
        }
        return new ModelAndView("index");
    }

    @GetMapping("/user")
    public ModelAndView user(Principal principal) {
        var original = recoveryUser(principal);
        if (original != null) {
            return new ModelAndView("user", Map.of("user", UserDTO.fromEntity(original)));
        }
        return new ModelAndView("user");
    }

    private UserEntity recoveryUser(Principal principal) {
        return principal != null ? (UserEntity) userRepository.findByEmail(principal.getName()) : null;
    }

}
