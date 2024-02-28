package com.social.noble.kizup.DTOs.response;

import com.social.noble.kizup.entities.UserEntity;

public record UserDTO(String email, String name, String avatarURL, Boolean emailVerified) {
    public static UserDTO fromEntity(UserEntity user) {
        return new UserDTO(user.getEmail(), user.getName(), user.getAvatarURL(), user.getEmailVerified());
    }
}
