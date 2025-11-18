package com.matricula_universitaria.service;

import com.matricula_universitaria.dto.MatriculaRequestDto;
import com.matricula_universitaria.dto.MatriculaResponseDto;

import java.util.List;

public interface MatriculaService {

    MatriculaResponseDto crear(MatriculaRequestDto request);

    MatriculaResponseDto actualizar(Long id, MatriculaRequestDto request);

    void eliminar(Long id);

    MatriculaResponseDto obtenerPorId(Long id);

    List<MatriculaResponseDto> listarTodos();

    List<MatriculaResponseDto> listarPorEstudiante(Long estudianteId);

    List<MatriculaResponseDto> listarPorSeccion(Long seccionId);
}
