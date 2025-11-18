package com.matricula_universitaria.repository;

import com.matricula_universitaria.entity.Profesor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProfesorRepository extends JpaRepository<Profesor, Long> {

    Optional<Profesor> findByDni(String dni);

    Optional<Profesor> findByEmail(String email);

    List<Profesor> findByApellidoContainingIgnoreCase(String apellido);
}
