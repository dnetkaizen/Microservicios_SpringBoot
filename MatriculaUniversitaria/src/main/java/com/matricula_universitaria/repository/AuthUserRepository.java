package com.matricula_universitaria.repository;

import com.matricula_universitaria.entity.AuthUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthUserRepository extends JpaRepository<AuthUser, Long> {

    Optional<AuthUser> findByUsernameIgnoreCase(String username);

    Optional<AuthUser> findByEmailIgnoreCase(String email);
}
