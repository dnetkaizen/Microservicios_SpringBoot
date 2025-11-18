package com.matricula_universitaria.repository;

import com.matricula_universitaria.entity.AuthRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthRoleRepository extends JpaRepository<AuthRole, Long> {

    Optional<AuthRole> findByNombreIgnoreCase(String nombre);
}
