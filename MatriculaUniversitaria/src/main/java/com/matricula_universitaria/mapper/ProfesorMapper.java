package com.matricula_universitaria.mapper;

import com.matricula_universitaria.dto.ProfesorRequestDto;
import com.matricula_universitaria.dto.ProfesorResponseDto;
import com.matricula_universitaria.entity.Profesor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProfesorMapper {

    public Profesor toEntity(ProfesorRequestDto dto) {
        if (dto == null) return null;
        Profesor entity = new Profesor();
        entity.setNombre(dto.nombre());
        entity.setApellido(dto.apellido());
        entity.setDni(dto.dni());
        entity.setEmail(dto.email());
        entity.setTelefono(dto.telefono());
        entity.setEspecialidad(dto.especialidad());
        entity.setTituloAcademico(dto.tituloAcademico());
        entity.setActivo(dto.activo() != null ? dto.activo() : Boolean.TRUE);
        return entity;
    }

    public void updateEntity(ProfesorRequestDto dto, Profesor entity) {
        entity.setNombre(dto.nombre());
        entity.setApellido(dto.apellido());
        entity.setDni(dto.dni());
        entity.setEmail(dto.email());
        entity.setTelefono(dto.telefono());
        entity.setEspecialidad(dto.especialidad());
        entity.setTituloAcademico(dto.tituloAcademico());
        if (dto.activo() != null) {
            entity.setActivo(dto.activo());
        }
    }

    public ProfesorResponseDto toResponse(Profesor entity) {
        if (entity == null) return null;
        return new ProfesorResponseDto(
                entity.getId(),
                entity.getNombre(),
                entity.getApellido(),
                entity.getDni(),
                entity.getEmail(),
                entity.getTelefono(),
                entity.getEspecialidad(),
                entity.getTituloAcademico(),
                entity.getFechaRegistro(),
                entity.getActivo()
        );
    }

    public List<ProfesorResponseDto> toResponseList(List<Profesor> entities) {
        return entities.stream().map(this::toResponse).toList();
    }
}
