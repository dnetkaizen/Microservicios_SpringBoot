package com.matricula_universitaria.mapper;

import com.matricula_universitaria.dto.EstudianteRequestDto;
import com.matricula_universitaria.dto.EstudianteResponseDto;
import com.matricula_universitaria.entity.Estudiante;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EstudianteMapper {

    public Estudiante toEntity(EstudianteRequestDto dto) {
        if (dto == null) return null;
        Estudiante entity = new Estudiante();
        entity.setNombre(dto.nombre());
        entity.setApellido(dto.apellido());
        entity.setDni(dto.dni());
        entity.setEmail(dto.email());
        entity.setTelefono(dto.telefono());
        entity.setFechaNacimiento(dto.fechaNacimiento());
        entity.setDireccion(dto.direccion());
        entity.setActivo(dto.activo() != null ? dto.activo() : Boolean.TRUE);
        return entity;
    }

    public void updateEntity(EstudianteRequestDto dto, Estudiante entity) {
        entity.setNombre(dto.nombre());
        entity.setApellido(dto.apellido());
        entity.setDni(dto.dni());
        entity.setEmail(dto.email());
        entity.setTelefono(dto.telefono());
        entity.setFechaNacimiento(dto.fechaNacimiento());
        entity.setDireccion(dto.direccion());
        if (dto.activo() != null) {
            entity.setActivo(dto.activo());
        }
    }

    public EstudianteResponseDto toResponse(Estudiante entity) {
        if (entity == null) return null;
        return new EstudianteResponseDto(
                entity.getId(),
                entity.getNombre(),
                entity.getApellido(),
                entity.getDni(),
                entity.getEmail(),
                entity.getTelefono(),
                entity.getFechaNacimiento(),
                entity.getDireccion(),
                entity.getFechaRegistro(),
                entity.getActivo()
        );
    }

    public List<EstudianteResponseDto> toResponseList(List<Estudiante> entities) {
        return entities.stream().map(this::toResponse).toList();
    }
}
