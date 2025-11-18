package com.matricula_universitaria.controller;

import com.matricula_universitaria.dto.SeccionRequestDto;
import com.matricula_universitaria.dto.SeccionResponseDto;
import com.matricula_universitaria.service.SeccionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/secciones")
public class SeccionController {

    private final SeccionService seccionService;

    public SeccionController(SeccionService seccionService) {
        this.seccionService = seccionService;
    }

    @PostMapping
    public ResponseEntity<SeccionResponseDto> crear(@Valid @RequestBody SeccionRequestDto request) {
        SeccionResponseDto creado = seccionService.crear(request);
        return ResponseEntity.created(URI.create("/api/secciones/" + creado.id())).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SeccionResponseDto> actualizar(@PathVariable Long id,
                                                         @Valid @RequestBody SeccionRequestDto request) {
        SeccionResponseDto actualizado = seccionService.actualizar(id, request);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        seccionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SeccionResponseDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(seccionService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<SeccionResponseDto>> listar(
            @RequestParam(name = "cursoId", required = false) Long cursoId,
            @RequestParam(name = "profesorId", required = false) Long profesorId) {
        if (cursoId != null) {
            return ResponseEntity.ok(seccionService.listarPorCurso(cursoId));
        }
        if (profesorId != null) {
            return ResponseEntity.ok(seccionService.listarPorProfesor(profesorId));
        }
        return ResponseEntity.ok(seccionService.listarTodos());
    }
}
