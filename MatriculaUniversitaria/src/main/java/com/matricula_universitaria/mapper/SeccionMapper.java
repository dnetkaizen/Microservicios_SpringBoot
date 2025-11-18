package com.matricula_universitaria.mapper;

import com.matricula_universitaria.dto.SeccionRequestDto;
import com.matricula_universitaria.dto.SeccionResponseDto;
import com.matricula_universitaria.entity.Curso;
import com.matricula_universitaria.entity.Profesor;
import com.matricula_universitaria.entity.Seccion;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SeccionMapper {

    public Seccion toEntity(SeccionRequestDto dto, Curso curso, Profesor profesor) {
        if (dto == null) return null;
        Seccion entity = new Seccion();
        entity.setCurso(curso);
        entity.setProfesor(profesor);
        entity.setCodigo(dto.codigo());
        entity.setCapacidadMaxima(dto.capacidadMaxima());
        entity.setAula(dto.aula());
        entity.setHorario(dto.horario());
        entity.setDias(dto.dias());
        entity.setPeriodoAcademico(dto.periodoAcademico());
        entity.setFechaInicio(dto.fechaInicio());
        entity.setFechaFin(dto.fechaFin());
        entity.setActivo(dto.activo() != null ? dto.activo() : Boolean.TRUE);
        return entity;
    }

    public void updateEntity(SeccionRequestDto dto, Seccion entity, Curso curso, Profesor profesor) {
        entity.setCurso(curso);
        entity.setProfesor(profesor);
        entity.setCodigo(dto.codigo());
        entity.setCapacidadMaxima(dto.capacidadMaxima());
        entity.setAula(dto.aula());
        entity.setHorario(dto.horario());
        entity.setDias(dto.dias());
        entity.setPeriodoAcademico(dto.periodoAcademico());
        entity.setFechaInicio(dto.fechaInicio());
        entity.setFechaFin(dto.fechaFin());
        if (dto.activo() != null) {
            entity.setActivo(dto.activo());
        }
    }

    public SeccionResponseDto toResponse(Seccion entity) {
        if (entity == null) return null;
        Long cursoId = entity.getCurso() != null ? entity.getCurso().getId() : null;
        String cursoCodigo = entity.getCurso() != null ? entity.getCurso().getCodigo() : null;
        String cursoNombre = entity.getCurso() != null ? entity.getCurso().getNombre() : null;
        Long profesorId = entity.getProfesor() != null ? entity.getProfesor().getId() : null;
        String profesorNombreCompleto = entity.getProfesor() != null
                ? entity.getProfesor().getNombre() + " " + entity.getProfesor().getApellido()
                : null;

        return new SeccionResponseDto(
                entity.getId(),
                cursoId,
                cursoCodigo,
                cursoNombre,
                profesorId,
                profesorNombreCompleto,
                entity.getCodigo(),
                entity.getCapacidadMaxima(),
                entity.getAula(),
                entity.getHorario(),
                entity.getDias(),
                entity.getPeriodoAcademico(),
                entity.getFechaInicio(),
                entity.getFechaFin(),
                entity.getFechaRegistro(),
                entity.getActivo()
        );
    }

    public List<SeccionResponseDto> toResponseList(List<Seccion> entities) {
        return entities.stream().map(this::toResponse).toList();
    }
}
