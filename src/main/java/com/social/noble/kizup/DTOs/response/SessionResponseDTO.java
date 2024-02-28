package com.social.noble.kizup.DTOs.response;

import com.social.noble.kizup.entities.UserEntity;

public record SessionResponseDTO(String token, UserDTO user) {

    public static SessionResponseDTO from(String token, UserEntity user) {
        return new SessionResponseDTO(token, UserDTO.fromEntity(user));
    }
}
