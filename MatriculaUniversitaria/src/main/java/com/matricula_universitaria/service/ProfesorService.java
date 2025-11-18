package com.matricula_universitaria.service;

import com.matricula_universitaria.dto.ProfesorRequestDto;
import com.matricula_universitaria.dto.ProfesorResponseDto;

import java.util.List;

public interface ProfesorService {

    ProfesorResponseDto crear(ProfesorRequestDto request);

    ProfesorResponseDto actualizar(Long id, ProfesorRequestDto request);

    void eliminar(Long id);

    ProfesorResponseDto obtenerPorId(Long id);

    List<ProfesorResponseDto> listarTodos();

    List<ProfesorResponseDto> buscarPorApellido(String apellido);
}
