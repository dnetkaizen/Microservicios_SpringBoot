package com.matricula_universitaria.repository;

import com.matricula_universitaria.entity.AuthUserRole;
import com.matricula_universitaria.entity.AuthUserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthUserRoleRepository extends JpaRepository<AuthUserRole, AuthUserRoleId> {
}
