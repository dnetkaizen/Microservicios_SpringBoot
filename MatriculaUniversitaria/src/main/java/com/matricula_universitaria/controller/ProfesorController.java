package com.matricula_universitaria.controller;

import com.matricula_universitaria.dto.ProfesorRequestDto;
import com.matricula_universitaria.dto.ProfesorResponseDto;
import com.matricula_universitaria.service.ProfesorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/profesores")
public class ProfesorController {

    private final ProfesorService profesorService;

    public ProfesorController(ProfesorService profesorService) {
        this.profesorService = profesorService;
    }

    @PostMapping
    public ResponseEntity<ProfesorResponseDto> crear(@Valid @RequestBody ProfesorRequestDto request) {
        ProfesorResponseDto creado = profesorService.crear(request);
        return ResponseEntity.created(URI.create("/api/profesores/" + creado.id())).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProfesorResponseDto> actualizar(@PathVariable Long id,
                                                          @Valid @RequestBody ProfesorRequestDto request) {
        ProfesorResponseDto actualizado = profesorService.actualizar(id, request);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        profesorService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfesorResponseDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(profesorService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<ProfesorResponseDto>> listar(
            @RequestParam(name = "apellido", required = false) String apellido) {
        if (apellido != null && !apellido.isBlank()) {
            return ResponseEntity.ok(profesorService.buscarPorApellido(apellido));
        }
        return ResponseEntity.ok(profesorService.listarTodos());
    }
}
