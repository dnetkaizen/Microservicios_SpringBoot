package com.matricula_universitaria.repository;

import com.matricula_universitaria.entity.AuthRolePermission;
import com.matricula_universitaria.entity.AuthRolePermissionId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthRolePermissionRepository extends JpaRepository<AuthRolePermission, AuthRolePermissionId> {
}
