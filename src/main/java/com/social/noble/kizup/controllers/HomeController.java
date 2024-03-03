package com.social.noble.kizup.controllers;

import java.time.Instant;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import com.social.noble.kizup.DTOs.response.UserDTO;
import com.social.noble.kizup.entities.UserEntity;

@Controller
@RequestMapping("/")
public class HomeController {

    @GetMapping
    public ModelAndView index(@AuthenticationPrincipal UserEntity original) {
        if (original != null) {
            var now = (Long) Instant.now().toEpochMilli();
            return new ModelAndView("index", Map.of("now", now.toString(), "user", UserDTO.fromEntity(original)));
        }
        return new ModelAndView("index");
    }

    @GetMapping("user")
    public ModelAndView user(@AuthenticationPrincipal UserEntity original) {
        if (original != null) {
            var now = (Long) Instant.now().toEpochMilli();
            return new ModelAndView("user", Map.of("now", now.toString(), "user", UserDTO.fromEntity(original)));
        }
        return new ModelAndView("user");
    }

    @GetMapping("quiz")
    public ModelAndView quiz(@AuthenticationPrincipal UserEntity original) {
        if (original != null) {
            var now = (Long) Instant.now().toEpochMilli();
            return new ModelAndView("new-quiz", Map.of("now", now.toString(), "user", UserDTO.fromEntity(original)));
        }
        return new ModelAndView("new-quiz");
    }

}
