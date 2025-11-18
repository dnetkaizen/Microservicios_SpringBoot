package com.matricula_universitaria.controller;

import com.matricula_universitaria.dto.AuthPermissionRequestDto;
import com.matricula_universitaria.dto.AuthPermissionResponseDto;
import com.matricula_universitaria.service.AuthPermissionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/auth/permissions")
public class AuthPermissionController {

    private final AuthPermissionService permissionService;

    public AuthPermissionController(AuthPermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @PostMapping
    public ResponseEntity<AuthPermissionResponseDto> crear(@Valid @RequestBody AuthPermissionRequestDto request) {
        AuthPermissionResponseDto creado = permissionService.crear(request);
        return ResponseEntity.created(URI.create("/api/auth/permissions/" + creado.id())).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuthPermissionResponseDto> actualizar(@PathVariable Long id,
                                                                @Valid @RequestBody AuthPermissionRequestDto request) {
        AuthPermissionResponseDto actualizado = permissionService.actualizar(id, request);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        permissionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuthPermissionResponseDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(permissionService.obtenerPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<AuthPermissionResponseDto>> listar() {
        return ResponseEntity.ok(permissionService.listarTodos());
    }
}
