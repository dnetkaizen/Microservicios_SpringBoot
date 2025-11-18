package com.matricula_universitaria.repository;

import com.matricula_universitaria.entity.Seccion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeccionRepository extends JpaRepository<Seccion, Long> {

    List<Seccion> findByCursoId(Long cursoId);

    List<Seccion> findByProfesorId(Long profesorId);
}
