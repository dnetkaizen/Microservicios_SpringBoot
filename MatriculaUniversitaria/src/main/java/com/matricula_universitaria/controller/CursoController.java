package com.matricula_universitaria.controller;

import com.matricula_universitaria.dto.CursoRequestDto;
import com.matricula_universitaria.dto.CursoResponseDto;
import com.matricula_universitaria.service.CursoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/cursos")
public class CursoController {

    private final CursoService cursoService;

    public CursoController(CursoService cursoService) {
        this.cursoService = cursoService;
    }

    @PostMapping
    public ResponseEntity<CursoResponseDto> crear(@Valid @RequestBody CursoRequestDto request) {
        CursoResponseDto creado = cursoService.crear(request);
        return ResponseEntity.created(URI.create("/api/cursos/" + creado.id())).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CursoResponseDto> actualizar(@PathVariable Long id,
                                                       @Valid @RequestBody CursoRequestDto request) {
        CursoResponseDto actualizado = cursoService.actualizar(id, request);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        cursoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CursoResponseDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(cursoService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<CursoResponseDto>> listar() {
        return ResponseEntity.ok(cursoService.listarTodos());
    }
}
