package com.matricula_universitaria.service.impl;

import com.matricula_universitaria.dto.ProfesorRequestDto;
import com.matricula_universitaria.dto.ProfesorResponseDto;
import com.matricula_universitaria.entity.Profesor;
import com.matricula_universitaria.exceptions.BadRequestException;
import com.matricula_universitaria.exceptions.ResourceNotFoundException;
import com.matricula_universitaria.mapper.ProfesorMapper;
import com.matricula_universitaria.repository.ProfesorRepository;
import com.matricula_universitaria.service.ProfesorService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProfesorServiceImpl implements ProfesorService {

    private final ProfesorRepository profesorRepository;
    private final ProfesorMapper profesorMapper;

    public ProfesorServiceImpl(ProfesorRepository profesorRepository,
                               ProfesorMapper profesorMapper) {
        this.profesorRepository = profesorRepository;
        this.profesorMapper = profesorMapper;
    }

    @Override
    public ProfesorResponseDto crear(ProfesorRequestDto request) {
        profesorRepository.findByDni(request.dni())
                .ifPresent(p -> { throw new BadRequestException("Ya existe un profesor con DNI " + request.dni()); });
        profesorRepository.findByEmail(request.email())
                .ifPresent(p -> { throw new BadRequestException("Ya existe un profesor con email " + request.email()); });

        Profesor entity = profesorMapper.toEntity(request);
        Profesor saved = profesorRepository.save(entity);
        return profesorMapper.toResponse(saved);
    }

    @Override
    public ProfesorResponseDto actualizar(Long id, ProfesorRequestDto request) {
        Profesor entity = profesorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profesor no encontrado con id " + id));

        if (!entity.getDni().equals(request.dni())) {
            profesorRepository.findByDni(request.dni())
                    .ifPresent(p -> { throw new BadRequestException("Ya existe un profesor con DNI " + request.dni()); });
        }
        if (!entity.getEmail().equals(request.email())) {
            profesorRepository.findByEmail(request.email())
                    .ifPresent(p -> { throw new BadRequestException("Ya existe un profesor con email " + request.email()); });
        }

        profesorMapper.updateEntity(request, entity);
        Profesor updated = profesorRepository.save(entity);
        return profesorMapper.toResponse(updated);
    }

    @Override
    public void eliminar(Long id) {
        Profesor entity = profesorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profesor no encontrado con id " + id));
        profesorRepository.delete(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public ProfesorResponseDto obtenerPorId(Long id) {
        Profesor entity = profesorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profesor no encontrado con id " + id));
        return profesorMapper.toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfesorResponseDto> listarTodos() {
        return profesorMapper.toResponseList(profesorRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfesorResponseDto> buscarPorApellido(String apellido) {
        return profesorMapper.toResponseList(
                profesorRepository.findByApellidoContainingIgnoreCase(apellido)
        );
    }
}
