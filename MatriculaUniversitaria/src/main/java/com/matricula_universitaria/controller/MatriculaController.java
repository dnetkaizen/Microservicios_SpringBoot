package com.matricula_universitaria.controller;

import com.matricula_universitaria.dto.MatriculaRequestDto;
import com.matricula_universitaria.dto.MatriculaResponseDto;
import com.matricula_universitaria.service.MatriculaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/matriculas")
public class MatriculaController {

    private final MatriculaService matriculaService;

    public MatriculaController(MatriculaService matriculaService) {
        this.matriculaService = matriculaService;
    }

    @PostMapping
    public ResponseEntity<MatriculaResponseDto> crear(@Valid @RequestBody MatriculaRequestDto request) {
        MatriculaResponseDto creada = matriculaService.crear(request);
        return ResponseEntity.created(URI.create("/api/matriculas/" + creada.id())).body(creada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MatriculaResponseDto> actualizar(@PathVariable Long id,
                                                           @Valid @RequestBody MatriculaRequestDto request) {
        MatriculaResponseDto actualizada = matriculaService.actualizar(id, request);
        return ResponseEntity.ok(actualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        matriculaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatriculaResponseDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(matriculaService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<MatriculaResponseDto>> listar(
            @RequestParam(name = "estudianteId", required = false) Long estudianteId,
            @RequestParam(name = "seccionId", required = false) Long seccionId) {
        if (estudianteId != null) {
            return ResponseEntity.ok(matriculaService.listarPorEstudiante(estudianteId));
        }
        if (seccionId != null) {
            return ResponseEntity.ok(matriculaService.listarPorSeccion(seccionId));
        }
        return ResponseEntity.ok(matriculaService.listarTodos());
    }
}
