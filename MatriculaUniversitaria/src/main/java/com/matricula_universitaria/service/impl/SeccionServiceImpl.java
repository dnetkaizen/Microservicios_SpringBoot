package com.matricula_universitaria.service.impl;

import com.matricula_universitaria.dto.SeccionRequestDto;
import com.matricula_universitaria.dto.SeccionResponseDto;
import com.matricula_universitaria.entity.Curso;
import com.matricula_universitaria.entity.Profesor;
import com.matricula_universitaria.entity.Seccion;
import com.matricula_universitaria.exceptions.ResourceNotFoundException;
import com.matricula_universitaria.mapper.SeccionMapper;
import com.matricula_universitaria.repository.CursoRepository;
import com.matricula_universitaria.repository.ProfesorRepository;
import com.matricula_universitaria.repository.SeccionRepository;
import com.matricula_universitaria.service.SeccionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SeccionServiceImpl implements SeccionService {

    private final SeccionRepository seccionRepository;
    private final CursoRepository cursoRepository;
    private final ProfesorRepository profesorRepository;
    private final SeccionMapper seccionMapper;

    public SeccionServiceImpl(SeccionRepository seccionRepository,
                              CursoRepository cursoRepository,
                              ProfesorRepository profesorRepository,
                              SeccionMapper seccionMapper) {
        this.seccionRepository = seccionRepository;
        this.cursoRepository = cursoRepository;
        this.profesorRepository = profesorRepository;
        this.seccionMapper = seccionMapper;
    }

    @Override
    public SeccionResponseDto crear(SeccionRequestDto request) {
        Curso curso = cursoRepository.findById(request.cursoId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con id " + request.cursoId()));
        Profesor profesor = profesorRepository.findById(request.profesorId())
                .orElseThrow(() -> new ResourceNotFoundException("Profesor no encontrado con id " + request.profesorId()));

        Seccion entity = seccionMapper.toEntity(request, curso, profesor);
        Seccion saved = seccionRepository.save(entity);
        return seccionMapper.toResponse(saved);
    }

    @Override
    public SeccionResponseDto actualizar(Long id, SeccionRequestDto request) {
        Seccion entity = seccionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sección no encontrada con id " + id));

        Curso curso = cursoRepository.findById(request.cursoId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con id " + request.cursoId()));
        Profesor profesor = profesorRepository.findById(request.profesorId())
                .orElseThrow(() -> new ResourceNotFoundException("Profesor no encontrado con id " + request.profesorId()));

        seccionMapper.updateEntity(request, entity, curso, profesor);
        Seccion updated = seccionRepository.save(entity);
        return seccionMapper.toResponse(updated);
    }

    @Override
    public void eliminar(Long id) {
        Seccion entity = seccionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sección no encontrada con id " + id));
        seccionRepository.delete(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public SeccionResponseDto obtenerPorId(Long id) {
        Seccion entity = seccionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sección no encontrada con id " + id));
        return seccionMapper.toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeccionResponseDto> listarTodos() {
        return seccionMapper.toResponseList(seccionRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeccionResponseDto> listarPorCurso(Long cursoId) {
        return seccionMapper.toResponseList(seccionRepository.findByCursoId(cursoId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeccionResponseDto> listarPorProfesor(Long profesorId) {
        return seccionMapper.toResponseList(seccionRepository.findByProfesorId(profesorId));
    }
}
