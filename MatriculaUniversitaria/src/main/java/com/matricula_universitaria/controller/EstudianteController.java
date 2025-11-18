package com.matricula_universitaria.controller;

import com.matricula_universitaria.dto.EstudianteRequestDto;
import com.matricula_universitaria.dto.EstudianteResponseDto;
import com.matricula_universitaria.service.EstudianteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/estudiantes")
public class EstudianteController {

    private final EstudianteService estudianteService;

    public EstudianteController(EstudianteService estudianteService) {
        this.estudianteService = estudianteService;
    }

    @PostMapping
    public ResponseEntity<EstudianteResponseDto> crear(@Valid @RequestBody EstudianteRequestDto request) {
        EstudianteResponseDto creado = estudianteService.crear(request);
        return ResponseEntity.created(URI.create("/api/estudiantes/" + creado.id())).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EstudianteResponseDto> actualizar(@PathVariable Long id,
                                                            @Valid @RequestBody EstudianteRequestDto request) {
        EstudianteResponseDto actualizado = estudianteService.actualizar(id, request);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        estudianteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EstudianteResponseDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(estudianteService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<EstudianteResponseDto>> listar(
            @RequestParam(name = "apellido", required = false) String apellido) {
        if (apellido != null && !apellido.isBlank()) {
            return ResponseEntity.ok(estudianteService.buscarPorApellido(apellido));
        }
        return ResponseEntity.ok(estudianteService.listarTodos());
    }
}
