package com.matricula_universitaria.repository;

import com.matricula_universitaria.entity.Matricula;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatriculaRepository extends JpaRepository<Matricula, Long> {

    Optional<Matricula> findByEstudianteIdAndSeccionId(Long estudianteId, Long seccionId);

    List<Matricula> findByEstudianteId(Long estudianteId);

    List<Matricula> findBySeccionId(Long seccionId);
}
