package com.matricula_universitaria.service;

import com.matricula_universitaria.dto.SeccionRequestDto;
import com.matricula_universitaria.dto.SeccionResponseDto;

import java.util.List;

public interface SeccionService {

    SeccionResponseDto crear(SeccionRequestDto request);

    SeccionResponseDto actualizar(Long id, SeccionRequestDto request);

    void eliminar(Long id);

    SeccionResponseDto obtenerPorId(Long id);

    List<SeccionResponseDto> listarTodos();

    List<SeccionResponseDto> listarPorCurso(Long cursoId);

    List<SeccionResponseDto> listarPorProfesor(Long profesorId);
}
