package com.matricula_universitaria.service.impl;

import com.matricula_universitaria.dto.MatriculaRequestDto;
import com.matricula_universitaria.dto.MatriculaResponseDto;
import com.matricula_universitaria.entity.Estudiante;
import com.matricula_universitaria.entity.Matricula;
import com.matricula_universitaria.entity.Seccion;
import com.matricula_universitaria.exceptions.BadRequestException;
import com.matricula_universitaria.exceptions.ResourceNotFoundException;
import com.matricula_universitaria.mapper.MatriculaMapper;
import com.matricula_universitaria.repository.EstudianteRepository;
import com.matricula_universitaria.repository.MatriculaRepository;
import com.matricula_universitaria.repository.SeccionRepository;
import com.matricula_universitaria.service.MatriculaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class MatriculaServiceImpl implements MatriculaService {

    private final MatriculaRepository matriculaRepository;
    private final EstudianteRepository estudianteRepository;
    private final SeccionRepository seccionRepository;
    private final MatriculaMapper matriculaMapper;

    public MatriculaServiceImpl(MatriculaRepository matriculaRepository,
                                EstudianteRepository estudianteRepository,
                                SeccionRepository seccionRepository,
                                MatriculaMapper matriculaMapper) {
        this.matriculaRepository = matriculaRepository;
        this.estudianteRepository = estudianteRepository;
        this.seccionRepository = seccionRepository;
        this.matriculaMapper = matriculaMapper;
    }

    @Override
    public MatriculaResponseDto crear(MatriculaRequestDto request) {
        Estudiante estudiante = estudianteRepository.findById(request.estudianteId())
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado con id " + request.estudianteId()));
        Seccion seccion = seccionRepository.findById(request.seccionId())
                .orElseThrow(() -> new ResourceNotFoundException("Sección no encontrada con id " + request.seccionId()));

        matriculaRepository.findByEstudianteIdAndSeccionId(estudiante.getId(), seccion.getId())
                .ifPresent(m -> { throw new BadRequestException("El estudiante ya está matriculado en esa sección"); });

        Matricula entity = matriculaMapper.toEntity(request, estudiante, seccion);
        Matricula saved = matriculaRepository.save(entity);
        return matriculaMapper.toResponse(saved);
    }

    @Override
    public MatriculaResponseDto actualizar(Long id, MatriculaRequestDto request) {
        Matricula entity = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula no encontrada con id " + id));

        Estudiante estudiante = estudianteRepository.findById(request.estudianteId())
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado con id " + request.estudianteId()));
        Seccion seccion = seccionRepository.findById(request.seccionId())
                .orElseThrow(() -> new ResourceNotFoundException("Sección no encontrada con id " + request.seccionId()));

        if (!entity.getEstudiante().getId().equals(estudiante.getId()) ||
                !entity.getSeccion().getId().equals(seccion.getId())) {
            matriculaRepository.findByEstudianteIdAndSeccionId(estudiante.getId(), seccion.getId())
                    .ifPresent(m -> { throw new BadRequestException("El estudiante ya está matriculado en esa sección"); });
        }

        matriculaMapper.updateEntity(request, entity, estudiante, seccion);
        Matricula updated = matriculaRepository.save(entity);
        return matriculaMapper.toResponse(updated);
    }

    @Override
    public void eliminar(Long id) {
        Matricula entity = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula no encontrada con id " + id));
        matriculaRepository.delete(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public MatriculaResponseDto obtenerPorId(Long id) {
        Matricula entity = matriculaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula no encontrada con id " + id));
        return matriculaMapper.toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatriculaResponseDto> listarTodos() {
        return matriculaMapper.toResponseList(matriculaRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatriculaResponseDto> listarPorEstudiante(Long estudianteId) {
        return matriculaMapper.toResponseList(matriculaRepository.findByEstudianteId(estudianteId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatriculaResponseDto> listarPorSeccion(Long seccionId) {
        return matriculaMapper.toResponseList(matriculaRepository.findBySeccionId(seccionId));
    }
}
