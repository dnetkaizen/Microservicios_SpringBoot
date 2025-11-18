package com.matricula_universitaria.mapper;

import com.matricula_universitaria.dto.CursoRequestDto;
import com.matricula_universitaria.dto.CursoResponseDto;
import com.matricula_universitaria.entity.Curso;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CursoMapper {

    public Curso toEntity(CursoRequestDto dto) {
        if (dto == null) return null;
        Curso entity = new Curso();
        entity.setCodigo(dto.codigo());
        entity.setNombre(dto.nombre());
        entity.setDescripcion(dto.descripcion());
        entity.setCreditos(dto.creditos());
        entity.setNivelSemestre(dto.nivelSemestre());
        entity.setActivo(dto.activo() != null ? dto.activo() : Boolean.TRUE);
        return entity;
    }

    public void updateEntity(CursoRequestDto dto, Curso entity) {
        entity.setCodigo(dto.codigo());
        entity.setNombre(dto.nombre());
        entity.setDescripcion(dto.descripcion());
        entity.setCreditos(dto.creditos());
        entity.setNivelSemestre(dto.nivelSemestre());
        if (dto.activo() != null) {
            entity.setActivo(dto.activo());
        }
    }

    public CursoResponseDto toResponse(Curso entity) {
        if (entity == null) return null;
        return new CursoResponseDto(
                entity.getId(),
                entity.getCodigo(),
                entity.getNombre(),
                entity.getDescripcion(),
                entity.getCreditos(),
                entity.getNivelSemestre(),
                entity.getFechaRegistro(),
                entity.getActivo()
        );
    }

    public List<CursoResponseDto> toResponseList(List<Curso> entities) {
        return entities.stream().map(this::toResponse).toList();
    }
}
