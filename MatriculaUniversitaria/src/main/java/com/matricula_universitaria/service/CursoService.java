package com.matricula_universitaria.service;

import com.matricula_universitaria.dto.CursoRequestDto;
import com.matricula_universitaria.dto.CursoResponseDto;

import java.util.List;

public interface CursoService {

    CursoResponseDto crear(CursoRequestDto request);

    CursoResponseDto actualizar(Long id, CursoRequestDto request);

    void eliminar(Long id);

    CursoResponseDto obtenerPorId(Long id);

    List<CursoResponseDto> listarTodos();
}
