package com.matricula_universitaria.service;

import com.matricula_universitaria.dto.AuthPermissionRequestDto;
import com.matricula_universitaria.dto.AuthPermissionResponseDto;

import java.util.List;

public interface AuthPermissionService {

    AuthPermissionResponseDto crear(AuthPermissionRequestDto request);

    AuthPermissionResponseDto actualizar(Long id, AuthPermissionRequestDto request);

    void eliminar(Long id);

    AuthPermissionResponseDto obtenerPorId(Long id);

    List<AuthPermissionResponseDto> listarTodos();
}
