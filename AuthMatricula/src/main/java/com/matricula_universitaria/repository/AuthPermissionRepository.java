package com.matricula_universitaria.repository;

import com.matricula_universitaria.entity.AuthPermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthPermissionRepository extends JpaRepository<AuthPermission, Long> {

    Optional<AuthPermission> findByNombreIgnoreCase(String nombre);
}
