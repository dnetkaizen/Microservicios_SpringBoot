package com.matricula_universitaria.repository;

import com.matricula_universitaria.entity.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EstudianteRepository extends JpaRepository<Estudiante, Long> {

    Optional<Estudiante> findByDni(String dni);

    Optional<Estudiante> findByEmail(String email);

    List<Estudiante> findByApellidoContainingIgnoreCase(String apellido);
}
