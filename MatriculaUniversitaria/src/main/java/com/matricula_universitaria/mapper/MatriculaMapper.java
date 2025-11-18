package com.matricula_universitaria.mapper;

import com.matricula_universitaria.dto.MatriculaRequestDto;
import com.matricula_universitaria.dto.MatriculaResponseDto;
import com.matricula_universitaria.entity.Estudiante;
import com.matricula_universitaria.entity.Matricula;
import com.matricula_universitaria.entity.Seccion;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class MatriculaMapper {

    public Matricula toEntity(MatriculaRequestDto dto, Estudiante estudiante, Seccion seccion) {
        if (dto == null) return null;
        Matricula entity = new Matricula();
        entity.setEstudiante(estudiante);
        entity.setSeccion(seccion);
        entity.setFechaMatricula(dto.fechaMatricula() != null ? dto.fechaMatricula() : LocalDate.now());
        entity.setEstado(dto.estado());
        entity.setCosto(dto.costo());
        entity.setMetodoPago(dto.metodoPago());
        return entity;
    }

    public void updateEntity(MatriculaRequestDto dto, Matricula entity, Estudiante estudiante, Seccion seccion) {
        entity.setEstudiante(estudiante);
        entity.setSeccion(seccion);
        if (dto.fechaMatricula() != null) {
            entity.setFechaMatricula(dto.fechaMatricula());
        }
        entity.setEstado(dto.estado());
        entity.setCosto(dto.costo());
        entity.setMetodoPago(dto.metodoPago());
    }

    public MatriculaResponseDto toResponse(Matricula entity) {
        if (entity == null) return null;
        Estudiante est = entity.getEstudiante();
        Seccion sec = entity.getSeccion();

        Long estudianteId = est != null ? est.getId() : null;
        String estudianteNombreCompleto = est != null ? est.getNombre() + " " + est.getApellido() : null;
        Long seccionId = sec != null ? sec.getId() : null;
        String seccionCodigo = sec != null ? sec.getCodigo() : null;
        String cursoCodigo = (sec != null && sec.getCurso() != null) ? sec.getCurso().getCodigo() : null;

        return new MatriculaResponseDto(
                entity.getId(),
                estudianteId,
                estudianteNombreCompleto,
                seccionId,
                seccionCodigo,
                cursoCodigo,
                entity.getFechaMatricula(),
                entity.getEstado(),
                entity.getCosto(),
                entity.getMetodoPago(),
                entity.getFechaRegistro()
        );
    }

    public List<MatriculaResponseDto> toResponseList(List<Matricula> entities) {
        return entities.stream().map(this::toResponse).toList();
    }
}
