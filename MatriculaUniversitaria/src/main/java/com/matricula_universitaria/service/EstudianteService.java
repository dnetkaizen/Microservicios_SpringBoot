package com.matricula_universitaria.service;

import com.matricula_universitaria.dto.EstudianteRequestDto;
import com.matricula_universitaria.dto.EstudianteResponseDto;

import java.util.List;

public interface EstudianteService {

    EstudianteResponseDto crear(EstudianteRequestDto request);

    EstudianteResponseDto actualizar(Long id, EstudianteRequestDto request);

    void eliminar(Long id);

    EstudianteResponseDto obtenerPorId(Long id);

    List<EstudianteResponseDto> listarTodos();

    List<EstudianteResponseDto> buscarPorApellido(String apellido);
}
