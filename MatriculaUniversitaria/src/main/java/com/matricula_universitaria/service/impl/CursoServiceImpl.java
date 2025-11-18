package com.matricula_universitaria.service.impl;

import com.matricula_universitaria.dto.CursoRequestDto;
import com.matricula_universitaria.dto.CursoResponseDto;
import com.matricula_universitaria.entity.Curso;
import com.matricula_universitaria.exceptions.BadRequestException;
import com.matricula_universitaria.exceptions.ResourceNotFoundException;
import com.matricula_universitaria.mapper.CursoMapper;
import com.matricula_universitaria.repository.CursoRepository;
import com.matricula_universitaria.service.CursoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CursoServiceImpl implements CursoService {

    private final CursoRepository cursoRepository;
    private final CursoMapper cursoMapper;

    public CursoServiceImpl(CursoRepository cursoRepository,
                            CursoMapper cursoMapper) {
        this.cursoRepository = cursoRepository;
        this.cursoMapper = cursoMapper;
    }

    @Override
    public CursoResponseDto crear(CursoRequestDto request) {
        cursoRepository.findByCodigo(request.codigo())
                .ifPresent(c -> { throw new BadRequestException("Ya existe un curso con código " + request.codigo()); });

        Curso entity = cursoMapper.toEntity(request);
        Curso saved = cursoRepository.save(entity);
        return cursoMapper.toResponse(saved);
    }

    @Override
    public CursoResponseDto actualizar(Long id, CursoRequestDto request) {
        Curso entity = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con id " + id));

        if (!entity.getCodigo().equals(request.codigo())) {
            cursoRepository.findByCodigo(request.codigo())
                    .ifPresent(c -> { throw new BadRequestException("Ya existe un curso con código " + request.codigo()); });
        }

        cursoMapper.updateEntity(request, entity);
        Curso updated = cursoRepository.save(entity);
        return cursoMapper.toResponse(updated);
    }

    @Override
    public void eliminar(Long id) {
        Curso entity = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con id " + id));
        cursoRepository.delete(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public CursoResponseDto obtenerPorId(Long id) {
        Curso entity = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con id " + id));
        return cursoMapper.toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CursoResponseDto> listarTodos() {
        return cursoMapper.toResponseList(cursoRepository.findAll());
    }
}
