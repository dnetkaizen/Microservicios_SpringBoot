package com.matricula_universitaria.service.impl;

import com.matricula_universitaria.dto.EstudianteRequestDto;
import com.matricula_universitaria.dto.EstudianteResponseDto;
import com.matricula_universitaria.entity.Estudiante;
import com.matricula_universitaria.exceptions.BadRequestException;
import com.matricula_universitaria.exceptions.ResourceNotFoundException;
import com.matricula_universitaria.mapper.EstudianteMapper;
import com.matricula_universitaria.repository.EstudianteRepository;
import com.matricula_universitaria.service.EstudianteService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EstudianteServiceImpl implements EstudianteService {

    private final EstudianteRepository estudianteRepository;
    private final EstudianteMapper estudianteMapper;

    public EstudianteServiceImpl(EstudianteRepository estudianteRepository,
                                 EstudianteMapper estudianteMapper) {
        this.estudianteRepository = estudianteRepository;
        this.estudianteMapper = estudianteMapper;
    }

    @Override
    public EstudianteResponseDto crear(EstudianteRequestDto request) {
        estudianteRepository.findByDni(request.dni())
                .ifPresent(e -> { throw new BadRequestException("Ya existe un estudiante con DNI " + request.dni()); });
        estudianteRepository.findByEmail(request.email())
                .ifPresent(e -> { throw new BadRequestException("Ya existe un estudiante con email " + request.email()); });

        Estudiante entity = estudianteMapper.toEntity(request);
        Estudiante saved = estudianteRepository.save(entity);
        return estudianteMapper.toResponse(saved);
    }

    @Override
    public EstudianteResponseDto actualizar(Long id, EstudianteRequestDto request) {
        Estudiante entity = estudianteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado con id " + id));

        if (!entity.getDni().equals(request.dni())) {
            estudianteRepository.findByDni(request.dni())
                    .ifPresent(e -> { throw new BadRequestException("Ya existe un estudiante con DNI " + request.dni()); });
        }
        if (!entity.getEmail().equals(request.email())) {
            estudianteRepository.findByEmail(request.email())
                    .ifPresent(e -> { throw new BadRequestException("Ya existe un estudiante con email " + request.email()); });
        }

        estudianteMapper.updateEntity(request, entity);
        Estudiante updated = estudianteRepository.save(entity);
        return estudianteMapper.toResponse(updated);
    }

    @Override
    public void eliminar(Long id) {
        Estudiante entity = estudianteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado con id " + id));
        estudianteRepository.delete(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public EstudianteResponseDto obtenerPorId(Long id) {
        Estudiante entity = estudianteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estudiante no encontrado con id " + id));
        return estudianteMapper.toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EstudianteResponseDto> listarTodos() {
        return estudianteMapper.toResponseList(estudianteRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EstudianteResponseDto> buscarPorApellido(String apellido) {
        return estudianteMapper.toResponseList(
                estudianteRepository.findByApellidoContainingIgnoreCase(apellido)
        );
    }
}
