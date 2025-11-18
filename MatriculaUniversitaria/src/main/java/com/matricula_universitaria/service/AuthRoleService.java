package com.matricula_universitaria.service;

import com.matricula_universitaria.dto.AuthRoleRequestDto;
import com.matricula_universitaria.dto.AuthRoleResponseDto;

import java.util.List;

public interface AuthRoleService {

    AuthRoleResponseDto crear(AuthRoleRequestDto request);

    AuthRoleResponseDto actualizar(Long id, AuthRoleRequestDto request);

    void eliminar(Long id);

    AuthRoleResponseDto obtenerPorId(Long id);

    List<AuthRoleResponseDto> listarTodos();

    AuthRoleResponseDto asignarPermiso(Long roleId, Long permissionId);

    AuthRoleResponseDto removerPermiso(Long roleId, Long permissionId);
}
