package com.social.noble.kizup.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import com.social.noble.kizup.entities.UserEntity;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    UserDetails findByEmail(String email);

    UserEntity findUserByEmail(String email);
}
