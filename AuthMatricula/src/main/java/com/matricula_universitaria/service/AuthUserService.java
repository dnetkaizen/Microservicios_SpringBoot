package com.matricula_universitaria.service;

import com.matricula_universitaria.dto.AuthUserRequestDto;
import com.matricula_universitaria.dto.AuthUserResponseDto;

import java.util.List;

public interface AuthUserService {

    AuthUserResponseDto crear(AuthUserRequestDto request);

    AuthUserResponseDto actualizar(Long id, AuthUserRequestDto request);

    void eliminar(Long id);

    AuthUserResponseDto obtenerPorId(Long id);

    List<AuthUserResponseDto> listarTodos();

    AuthUserResponseDto asignarRol(Long userId, Long roleId);

    AuthUserResponseDto removerRol(Long userId, Long roleId);
}
